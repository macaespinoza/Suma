-- =============================================================================
-- SUMA - Plataforma PropTech y de Cohesión Comunitaria
-- Script de Migración Inicial (init.sql)
-- Motor: PostgreSQL (Google Cloud SQL)
-- Autor: Antigravity (Arquitecto Cloud)
-- Convención: Nombres de tablas, columnas y comentarios en Español.
-- =============================================================================

-- Habilitamos la extensión para generar UUIDs automáticamente.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- SECCIÓN 1: TIPOS ENUMERADOS (ENUMs)
-- Definidos primero ya que son dependencias de las tablas.
-- =============================================================================

-- Roles de usuario dentro de la plataforma.
CREATE TYPE tipo_rol_usuario AS ENUM (
    'admin',
    'propietario',
    'arrendatario',
    'conserje'
);

-- Tipos de titulares administrativos de una unidad.
CREATE TYPE tipo_titular_unidad AS ENUM (
    'propietario',
    'arrendatario'
);

-- Estado del período de gastos comunes.
CREATE TYPE tipo_estado_gasto_mes AS ENUM (
    'borrador',
    'publicado'
);

-- Estado del cobro por unidad.
CREATE TYPE tipo_estado_pago AS ENUM (
    'pendiente',
    'pagado',
    'moroso'
);

-- Pasarelas de pago soportadas por la plataforma.
CREATE TYPE tipo_pasarela AS ENUM (
    'flow',
    'fintoc',
    'mercado_pago',
    'webpay',
    'transferencia_manual'
);

-- Pasarelas configurables por el condominio (subconjunto activo).
CREATE TYPE tipo_pasarela_config AS ENUM (
    'flow',
    'fintoc',
    'mercado_pago'
);

-- Estado del ciclo de vida de una transacción en la pasarela.
CREATE TYPE tipo_estado_transaccion AS ENUM (
    'iniciada',
    'exitosa',
    'fallida',
    'reembolsada'
);

-- Tipos de publicación en el muro comunitario.
CREATE TYPE tipo_publicacion AS ENUM (
    'aviso_oficial',
    'social',
    'mercadito',
    'evento',
    'encuesta'
);

-- Estado de un ítem en el Mercadito.
CREATE TYPE tipo_estado_item_mercadito AS ENUM (
    'disponible',
    'vendido',
    'pausado'
);

-- Categoría de un ítem en el Mercadito.
CREATE TYPE tipo_categoria_mercadito AS ENUM (
    'producto',
    'servicio'
);

-- Categoría de evento comunitario.
CREATE TYPE tipo_categoria_evento AS ENUM (
    'reunion_oficial',
    'actividad_social',
    'playdate_mascotas',
    'playdate_ninos'
);


-- =============================================================================
-- SECCIÓN 2: FUNCIÓN DE VALIDACIÓN RUT CHILENO (Módulo 11)
-- =============================================================================

-- Función que valida matemáticamente el dígito verificador de un RUT chileno.
-- Retorna TRUE si el RUT es válido, FALSE en caso contrario.
-- Formato esperado de entrada: '12345678-9' o '12345678-K'
CREATE OR REPLACE FUNCTION validar_rut(rut_input VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    rut_limpio  VARCHAR;
    cuerpo      VARCHAR;
    dv_ingresado CHAR(1);
    suma        INTEGER := 0;
    multiplo    INTEGER := 2;
    dv_calculado VARCHAR;
    i           INTEGER;
BEGIN
    -- Normalizamos: eliminamos puntos y convertimos a mayúsculas.
    rut_limpio := UPPER(REPLACE(REPLACE(rut_input, '.', ''), ' ', ''));

    -- Validamos el formato básico con guión.
    IF rut_limpio NOT SIMILAR TO '[0-9]{7,8}-[0-9Kk]' THEN
        RETURN FALSE;
    END IF;

    -- Separamos cuerpo y dígito verificador.
    cuerpo       := SPLIT_PART(rut_limpio, '-', 1);
    dv_ingresado := SPLIT_PART(rut_limpio, '-', 2);

    -- Algoritmo Módulo 11: suma ponderada de dígitos de derecha a izquierda.
    FOR i IN REVERSE LENGTH(cuerpo)..1 LOOP
        suma      := suma + (SUBSTR(cuerpo, i, 1)::INTEGER * multiplo);
        multiplo  := CASE WHEN multiplo = 7 THEN 2 ELSE multiplo + 1 END;
    END LOOP;

    -- Calculamos el dígito verificador esperado.
    dv_calculado := CASE (11 - (suma % 11))
        WHEN 11 THEN '0'
        WHEN 10 THEN 'K'
        ELSE (11 - (suma % 11))::VARCHAR
    END;

    RETURN dv_calculado = dv_ingresado;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- DOMAIN reutilizable para columnas de tipo RUT en toda la base de datos.
-- Garantiza validación automática en cualquier tabla que lo use.
CREATE DOMAIN dominio_rut AS VARCHAR(12)
    CHECK (validar_rut(VALUE));


-- =============================================================================
-- SECCIÓN 3: FUNCIÓN Y TRIGGER DE AUDITORÍA (updated_at automático)
-- =============================================================================

-- Función genérica que actualiza el campo updated_at al momento de un UPDATE.
CREATE OR REPLACE FUNCTION fn_actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- SECCIÓN 4: TABLAS - MÓDULO 1: NÚCLEO (Estructura y Personas)
-- =============================================================================

-- Tabla: Condominios
-- Entidad raíz del sistema. Cada condominio es un ecosistema independiente.
CREATE TABLE Condominios (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre           VARCHAR(200) NOT NULL,
    direccion        VARCHAR(300) NOT NULL,
    rut_comunidad    dominio_rut  UNIQUE,  -- Opcional. RUT validado con Módulo 11 si existe.
    cantidad_unidades INTEGER     NOT NULL DEFAULT 0,
    saldo_fondo_reserva DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    activo           BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_condominios_updated_at
    BEFORE UPDATE ON Condominios
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- Tabla: Unidades_Vecinales
-- Representa cada departamento, casa o unidad dentro de un condominio.
CREATE TABLE Unidades_Vecinales (
    id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id    UUID           NOT NULL REFERENCES Condominios(id) ON DELETE RESTRICT,
    bloque_edificio  VARCHAR(100),   -- Crucial para agrupar torres/bloques en Arica.
    numero           VARCHAR(20)    NOT NULL,
    metros_cuadrados DECIMAL(8, 2)  DEFAULT NULL, -- Superficie útil, base para cálculo legal de alícuota. NULL = no registrado.
    alicuota         DECIMAL(5, 4)  NOT NULL DEFAULT 0.0000, -- Porcentaje de participación (ej: 0.0250 = 2.50%).
    tiene_estacionamiento BOOLEAN   NOT NULL DEFAULT FALSE,
    numero_estacionamiento VARCHAR(50),
    tiene_bodega     BOOLEAN        NOT NULL DEFAULT FALSE,
    numero_bodega    VARCHAR(50),
    activo           BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_unidad_por_condominio UNIQUE (condominio_id, bloque_edificio, numero)
);

CREATE TRIGGER trg_unidades_vecinales_updated_at
    BEFORE UPDATE ON Unidades_Vecinales
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- Tabla: Titulares_Unidad
-- Ficha administrativa para los residentes de una unidad. Permite registrarlos sin que tengan cuenta de usuario.
CREATE TABLE Titulares_Unidad (
    id           UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
    unidad_id    UUID                 NOT NULL REFERENCES Unidades_Vecinales(id) ON DELETE CASCADE,
    tipo         tipo_titular_unidad  NOT NULL,
    nombre       VARCHAR(200)         NOT NULL,
    rut          dominio_rut,         -- Puede ser nulo si no se tiene, pero si se provee se valida.
    email        VARCHAR(254),
    telefono     VARCHAR(20),
    usuario_id   UUID                 REFERENCES Usuarios(id) ON DELETE SET NULL, -- Si se registra en la plataforma.
    created_at   TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_titular_por_unidad_tipo UNIQUE (unidad_id, tipo) -- Solo 1 propietario y 1 arrendatario activo por unidad.
);

CREATE TRIGGER trg_titulares_unidad_updated_at
    BEFORE UPDATE ON Titulares_Unidad
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- Tabla: Vehiculos
-- Registro de vehículos vinculados a una unidad.
CREATE TABLE Vehiculos (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    unidad_id       UUID         NOT NULL REFERENCES Unidades_Vecinales(id) ON DELETE CASCADE,
    tipo_vehiculo   VARCHAR(50)  NOT NULL, -- Ej: Auto, Moto, Camioneta
    patente         VARCHAR(10)  NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_vehiculos_updated_at
    BEFORE UPDATE ON Vehiculos
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- Tabla: Usuarios
-- Personas registradas en la plataforma. Vinculadas a Firebase Auth mediante firebase_uid.
CREATE TABLE Usuarios (
    id              UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid    VARCHAR(128)     NOT NULL UNIQUE, -- UID de Firebase Authentication.
    rut             dominio_rut      NOT NULL UNIQUE, -- RUT validado con Módulo 11.
    nombre_completo VARCHAR(200)     NOT NULL,
    email           VARCHAR(254)     NOT NULL UNIQUE,
    telefono        VARCHAR(20),
    rol             tipo_rol_usuario NOT NULL DEFAULT 'arrendatario',
    deleted_at      TIMESTAMPTZ,     -- Eliminación lógica. NULL = activo.
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON Usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- Tabla: Usuarios_Unidades (Tabla Pivote N:M)
-- Relaciona usuarios con sus unidades. Un usuario puede vivir en varias unidades
-- y una unidad puede tener varios usuarios (propietario + arrendatario).
CREATE TABLE Usuarios_Unidades (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id   UUID        NOT NULL REFERENCES Usuarios(id) ON DELETE RESTRICT,
    unidad_id    UUID        NOT NULL REFERENCES Unidades_Vecinales(id) ON DELETE RESTRICT,
    es_residente BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_usuario_unidad UNIQUE (usuario_id, unidad_id)
);

CREATE TRIGGER trg_usuarios_unidades_updated_at
    BEFORE UPDATE ON Usuarios_Unidades
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- =============================================================================
-- SECCIÓN 5: TABLAS - MÓDULO 2: ADMINISTRATIVO Y CONTABILIDAD
-- =============================================================================

-- Tabla: Gastos_Comunes_Mes
-- Representa el período mensual de gastos de un condominio.
-- En estado 'borrador' el admin puede editarlo; en 'publicado' ya se notificó a los residentes.
CREATE TABLE Gastos_Comunes_Mes (
    id              UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id   UUID                    NOT NULL REFERENCES Condominios(id) ON DELETE RESTRICT,
    mes_anio        DATE                    NOT NULL, -- Se usa el primer día del mes: ej. '2025-06-01'.
    total_gastos    DECIMAL(12, 2)          NOT NULL DEFAULT 0.00,
    monto_fondo_reserva DECIMAL(12, 2)      NOT NULL DEFAULT 0.00,
    estado          tipo_estado_gasto_mes   NOT NULL DEFAULT 'borrador',
    created_at      TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_gasto_mes_por_condominio UNIQUE (condominio_id, mes_anio)
);

CREATE TRIGGER trg_gastos_comunes_mes_updated_at
    BEFORE UPDATE ON Gastos_Comunes_Mes
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- Tabla: Egresos_Operativos
-- Cada línea de gasto que compone el total del mes (agua, luz, portería, etc.).
CREATE TABLE Egresos_Operativos (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    gasto_comun_mes_id    UUID          NOT NULL REFERENCES Gastos_Comunes_Mes(id) ON DELETE RESTRICT,
    categoria             VARCHAR(100)  NOT NULL, -- Ej: 'Agua', 'Luz', 'Portería', 'Mantención'.
    descripcion           TEXT,
    monto                 DECIMAL(12, 2) NOT NULL,
    archivo_respaldo_url  VARCHAR(500),           -- URL de Cloud Storage para el comprobante/boleta.
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_egresos_operativos_updated_at
    BEFORE UPDATE ON Egresos_Operativos
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- Tabla: Cobros_Unidad
-- El cobro individual generado para cada unidad al publicar el gasto del mes.
-- Incluye el saldo arrastrado del mes anterior para calcular el total real a pagar.
CREATE TABLE Cobros_Unidad (
    id                  UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    unidad_id           UUID                NOT NULL REFERENCES Unidades_Vecinales(id) ON DELETE RESTRICT,
    gasto_comun_mes_id  UUID                NOT NULL REFERENCES Gastos_Comunes_Mes(id) ON DELETE RESTRICT,
    monto_cobrado       DECIMAL(12, 2)      NOT NULL, -- Monto del mes calculado por alícuota.
    saldo_anterior      DECIMAL(12, 2)      NOT NULL DEFAULT 0.00, -- Deuda arrastrada de meses previos.
    total_a_pagar       DECIMAL(12, 2)      NOT NULL, -- monto_cobrado + saldo_anterior.
    estado_pago         tipo_estado_pago    NOT NULL DEFAULT 'pendiente',
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cobro_por_unidad_mes UNIQUE (unidad_id, gasto_comun_mes_id)
);

CREATE TRIGGER trg_cobros_unidad_updated_at
    BEFORE UPDATE ON Cobros_Unidad
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- Tabla: Transacciones_Pasarela
-- Registra el ciclo de vida de un intento de pago en línea (Flow, Fintoc, etc.).
-- Se crea cuando el usuario hace clic en "Pagar" y se actualiza con el resultado del webhook.
CREATE TABLE Transacciones_Pasarela (
    id                  UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
    cobro_unidad_id     UUID                    NOT NULL REFERENCES Cobros_Unidad(id) ON DELETE RESTRICT,
    pasarela            tipo_pasarela           NOT NULL,
    token_transaccion   VARCHAR(512)            UNIQUE,    -- Token único de la pasarela. Nullable hasta que se inicie.
    monto_transaccion   DECIMAL(12, 2)          NOT NULL,
    estado_transaccion  tipo_estado_transaccion NOT NULL DEFAULT 'iniciada',
    created_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_transacciones_pasarela_updated_at
    BEFORE UPDATE ON Transacciones_Pasarela
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- Tabla: Pagos_Registrados
-- Registro contable definitivo de un pago confirmado.
-- Puede venir de una pasarela online (transaccion_id) o ser ingresado manualmente por el admin.
CREATE TABLE Pagos_Registrados (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    cobro_unidad_id   UUID          NOT NULL REFERENCES Cobros_Unidad(id) ON DELETE RESTRICT,
    transaccion_id    UUID          REFERENCES Transacciones_Pasarela(id) ON DELETE SET NULL, -- Nullable: pago manual no tiene pasarela.
    monto_pagado      DECIMAL(12, 2) NOT NULL,
    fecha_pago        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    comprobante_url   VARCHAR(500),  -- URL de Cloud Storage para el comprobante de pago manual.
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_pagos_registrados_updated_at
    BEFORE UPDATE ON Pagos_Registrados
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- Tabla: Credenciales_Pago_Condominio
-- Almacena las credenciales de API de la pasarela de pago configurada por cada condominio.
-- CRÍTICO DE SEGURIDAD: Los valores de api_key y secret_key deben ser encriptados
-- en el backend (Node.js) con AES-256 ANTES de ser insertados en esta tabla.
CREATE TABLE Credenciales_Pago_Condominio (
    id              UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id   UUID                    NOT NULL REFERENCES Condominios(id) ON DELETE CASCADE,
    pasarela        tipo_pasarela_config    NOT NULL,
    api_key         TEXT                    NOT NULL, -- Almacenar SIEMPRE encriptado desde el backend.
    secret_key      TEXT,                             -- Almacenar SIEMPRE encriptado desde el backend.
    activo          BOOLEAN                 NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_credencial_por_pasarela UNIQUE (condominio_id, pasarela)
);

CREATE TRIGGER trg_credenciales_pago_updated_at
    BEFORE UPDATE ON Credenciales_Pago_Condominio
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- =============================================================================
-- SECCIÓN 6: TABLAS - MÓDULO 3: INTERACCIÓN COMUNITARIA Y RED SOCIAL
-- =============================================================================

-- Tabla: Mascotas
-- Registro de mascotas por unidad. Facilita organización de playdates y control comunitario.
CREATE TABLE Mascotas (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    unidad_id   UUID        NOT NULL REFERENCES Unidades_Vecinales(id) ON DELETE RESTRICT,
    nombre      VARCHAR(100) NOT NULL,
    especie     VARCHAR(50)  NOT NULL, -- Ej: 'Perro', 'Gato', 'Ave'.
    raza        VARCHAR(100),
    foto_url    VARCHAR(500),          -- URL de Cloud Storage para la foto de la mascota.
    activo      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_mascotas_updated_at
    BEFORE UPDATE ON Mascotas
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- Tabla: Publicaciones_Muro
-- Tabla central del ecosistema social del condominio (el "feed" de la mini red social).
-- Nota Arquitectónica: Los "likes" y "comentarios" viven en Firebase Firestore
-- para soportar interacciones en tiempo real sin saturar Cloud SQL.
CREATE TABLE Publicaciones_Muro (
    id              UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    condominio_id   UUID             NOT NULL REFERENCES Condominios(id) ON DELETE CASCADE,
    autor_id        UUID             NOT NULL REFERENCES Usuarios(id) ON DELETE RESTRICT,
    tipo            tipo_publicacion NOT NULL,
    titulo          VARCHAR(200)     NOT NULL,
    contenido       TEXT             NOT NULL,
    imagen_url      VARCHAR(500),    -- URL de Cloud Storage para imagen adjunta opcional.
    deleted_at      TIMESTAMPTZ,     -- Eliminación lógica. NULL = publicación activa.
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_publicaciones_muro_updated_at
    BEFORE UPDATE ON Publicaciones_Muro
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- Tabla: Mercadito_Items
-- Extensión de Publicaciones_Muro para publicaciones de tipo 'mercadito'.
-- Implementa el Marketplace comunitario (economía circular).
CREATE TABLE Mercadito_Items (
    id              UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
    publicacion_id  UUID                        NOT NULL UNIQUE REFERENCES Publicaciones_Muro(id) ON DELETE CASCADE,
    precio          DECIMAL(12, 2)              NOT NULL DEFAULT 0.00, -- 0 = gratis/trueque.
    estado          tipo_estado_item_mercadito  NOT NULL DEFAULT 'disponible',
    categoria       tipo_categoria_mercadito    NOT NULL,
    created_at      TIMESTAMPTZ                 NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ                 NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_mercadito_items_updated_at
    BEFORE UPDATE ON Mercadito_Items
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- Tabla: Eventos_Comunitarios
-- Extensión de Publicaciones_Muro para publicaciones de tipo 'evento'.
-- Permite planificar reuniones de copropietarios, actividades sociales y playdates.
CREATE TABLE Eventos_Comunitarios (
    id                  UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
    publicacion_id      UUID                    NOT NULL UNIQUE REFERENCES Publicaciones_Muro(id) ON DELETE CASCADE,
    fecha_hora_evento   TIMESTAMPTZ             NOT NULL,
    lugar               VARCHAR(300)            NOT NULL,
    categoria_evento    tipo_categoria_evento   NOT NULL,
    created_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_eventos_comunitarios_updated_at
    BEFORE UPDATE ON Eventos_Comunitarios
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- Tabla: Registro_Visitas
-- Control de acceso: registro de visitas por unidad. Gestionado por conserjes.
CREATE TABLE Registro_Visitas (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    unidad_id           UUID        NOT NULL REFERENCES Unidades_Vecinales(id) ON DELETE RESTRICT,
    nombre_visita       VARCHAR(200) NOT NULL,
    rut_visita          VARCHAR(12), -- Nullable: extranjeros o menores pueden no tener RUT chileno.
    fecha_hora_ingreso  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_hora_salida   TIMESTAMPTZ,             -- NULL = la visita aún está en el condominio.
    patente_vehiculo    VARCHAR(10),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_registro_visitas_updated_at
    BEFORE UPDATE ON Registro_Visitas
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();


-- =============================================================================
-- SECCIÓN 7: ÍNDICES DE RENDIMIENTO
-- Optimizan las consultas más frecuentes de la aplicación.
-- =============================================================================

-- Índices para consultas de cobranza (las más críticas del módulo admin).
CREATE INDEX idx_cobros_unidad_estado     ON Cobros_Unidad(estado_pago);
CREATE INDEX idx_cobros_unidad_unidad     ON Cobros_Unidad(unidad_id);
CREATE INDEX idx_pagos_cobro              ON Pagos_Registrados(cobro_unidad_id);
CREATE INDEX idx_transacciones_estado     ON Transacciones_Pasarela(estado_transaccion);
CREATE INDEX idx_transacciones_token      ON Transacciones_Pasarela(token_transaccion);

-- Índices para el muro social (feed del condominio).
CREATE INDEX idx_muro_condominio_tipo     ON Publicaciones_Muro(condominio_id, tipo);
CREATE INDEX idx_muro_deleted_at          ON Publicaciones_Muro(deleted_at) WHERE deleted_at IS NULL;

-- Índices para el módulo de personas.
CREATE INDEX idx_usuarios_firebase_uid    ON Usuarios(firebase_uid);
CREATE INDEX idx_usuarios_unidades_unidad ON Usuarios_Unidades(unidad_id);

-- Índice para eventos futuros (consulta habitual: "próximos eventos").
CREATE INDEX idx_eventos_fecha            ON Eventos_Comunitarios(fecha_hora_evento);

-- Índice para el Mercadito (consulta habitual: ítems disponibles).
CREATE INDEX idx_mercadito_estado         ON Mercadito_Items(estado);


-- =============================================================================
-- FIN DEL SCRIPT
-- Generado por: Antigravity (Arquitecto Cloud)
-- Para: SUMA - Plataforma PropTech / ComunidApp - Arica, Chile
-- =============================================================================
