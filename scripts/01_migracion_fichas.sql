-- Migración para añadir fichas administrativas de unidades
-- Agrega columnas a Unidades_Vecinales
ALTER TABLE Unidades_Vecinales 
    ADD COLUMN IF NOT EXISTS tiene_estacionamiento BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS numero_estacionamiento VARCHAR(50),
    ADD COLUMN IF NOT EXISTS tiene_bodega BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS numero_bodega VARCHAR(50);

-- Crea ENUM si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_titular_unidad') THEN
        CREATE TYPE tipo_titular_unidad AS ENUM ('propietario', 'arrendatario');
    END IF;
END
$$;

-- Tabla: Titulares_Unidad
CREATE TABLE IF NOT EXISTS Titulares_Unidad (
    id           UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
    unidad_id    UUID                 NOT NULL REFERENCES Unidades_Vecinales(id) ON DELETE CASCADE,
    tipo         tipo_titular_unidad  NOT NULL,
    nombre       VARCHAR(200)         NOT NULL,
    rut          dominio_rut,
    email        VARCHAR(254),
    telefono     VARCHAR(20),
    usuario_id   UUID                 REFERENCES Usuarios(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_titular_por_unidad_tipo UNIQUE (unidad_id, tipo)
);

-- Trigger para Titulares_Unidad si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_titulares_unidad_updated_at') THEN
        CREATE TRIGGER trg_titulares_unidad_updated_at
            BEFORE UPDATE ON Titulares_Unidad
            FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
    END IF;
END
$$;

-- Tabla: Vehiculos
CREATE TABLE IF NOT EXISTS Vehiculos (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    unidad_id       UUID         NOT NULL REFERENCES Unidades_Vecinales(id) ON DELETE CASCADE,
    tipo_vehiculo   VARCHAR(50)  NOT NULL,
    patente         VARCHAR(10)  NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Trigger para Vehiculos si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_vehiculos_updated_at') THEN
        CREATE TRIGGER trg_vehiculos_updated_at
            BEFORE UPDATE ON Vehiculos
            FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
    END IF;
END
$$;
