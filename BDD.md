# 📋 Especificación de Arquitectura de Base de Datos (PostgreSQL)

**Rol de la IA (Antigravity):** Actuar como Arquitecto de Base de Datos y Experto en PostgreSQL, definiendo la estructura dura y crítica del sistema.
**Objetivo:** Generar el script SQL de migración inicial (`init.sql`) para levantar la base de datos de una aplicación PropTech y de gestión comunitaria enfocada en la realidad local de Arica, Chile.

## 📌 Contexto del Proyecto
La aplicación tiene un doble propósito:
1. **Administrativo/Contable:** Gestión eficiente de gastos comunes, prorrateo y cobranza para condominios.
2. **Comunitario/Social:** Fomento de la participación vecinal, redes de apoyo, control de mascotas y acceso.

**Motor de Base de Datos:** PostgreSQL (alojado en Google Cloud SQL).

## ⚙️ Reglas de Negocio y Restricciones Técnicas Obligatorias
* **Idioma:** Todas las tablas, columnas y comentarios en el código SQL deben estar en Español.
* **Claves Primarias:** Utilizar `UUID` generados automáticamente (`gen_random_uuid()`) para todos los IDs principales.
* **El RUT Chileno (CRÍTICO):** El RUT es el identificador nacional. Debes crear un `DOMAIN` o un `CHECK constraint` personalizado en PostgreSQL para validar que el formato ingresado sea correcto y, de ser posible, que cumpla la validación matemática del Módulo 11 (o al menos dejar la estructura lista mediante una función en PL/pgSQL).
* **Auditoría:** Todas las tablas deben incluir los campos `created_at` y `updated_at` (con un trigger para actualización automática).
* **Eliminación Lógica:** En lugar de hacer `DELETE` en registros contables o usuarios, implementar un campo `deleted_at` o `activo` (Booleano) donde corresponda.

---

## 🏗️ Esquema Relacional a Implementar

Por favor, genera el código SQL (DDL) para crear las siguientes tablas, respetando las claves foráneas (FK) y las restricciones:

### Módulo 1: Núcleo (Estructura y Personas)
1. **`Condominios`**
   * `id` (UUID, PK)
   * `nombre` (VARCHAR)
   * `direccion` (VARCHAR)
   * `rut_comunidad` (VARCHAR, Único, Validado)
   * `cantidad_unidades` (INTEGER)
2. **`Unidades_Vecinales`**
   * `id` (UUID, PK)
   * `condominio_id` (UUID, FK -> Condominios)
   * `bloque_edificio` (VARCHAR) -> *Crucial para agrupar casas o torres dentro de un mismo condominio.*
   * `numero` (VARCHAR)
   * `alicuota` (DECIMAL 5,4) -> *Porcentaje de participación.*
3. **`Usuarios`**
   * `id` (UUID, PK)
   * `firebase_uid` (VARCHAR, Único)
   * `rut` (VARCHAR, Único, NOT NULL, Validado mediante función/domain)
   * `nombre_completo` (VARCHAR)
   * `email` (VARCHAR, Único)
   * `telefono` (VARCHAR)
   * `rol` (ENUM: 'admin', 'propietario', 'arrendatario', 'conserje')
4. **`Usuarios_Unidades`** (Tabla pivote N:M)
   * `id` (UUID, PK)
   * `usuario_id` (UUID, FK -> Usuarios)
   * `unidad_id` (UUID, FK -> Unidades_Vecinales)
   * `es_residente` (BOOLEAN)

### Módulo 2: Administrativo y Contabilidad
5. **`Gastos_Comunes_Mes`**
   * `id` (UUID, PK)
   * `condominio_id` (UUID, FK -> Condominios)
   * `mes_anio` (DATE) -> *Se usa el primer día del mes para representar el periodo.*
   * `total_gastos` (DECIMAL 12,2)
   * `estado` (ENUM: 'borrador', 'publicado')
6. **`Egresos_Operativos`**
   * `id` (UUID, PK)
   * `gasto_comun_mes_id` (UUID, FK -> Gastos_Comunes_Mes)
   * `categoria` (VARCHAR)
   * `monto` (DECIMAL 12,2)
   * `archivo_respaldo_url` (VARCHAR, Nullable)
7. **`Cobros_Unidad`**
   * `id` (UUID, PK)
   * `unidad_id` (UUID, FK -> Unidades_Vecinales)
   * `gasto_comun_mes_id` (UUID, FK -> Gastos_Comunes_Mes)
   * `monto_cobrado` (DECIMAL 12,2)
   * `saldo_anterior` (DECIMAL 12,2)
   * `total_a_pagar` (DECIMAL 12,2)
   * `estado_pago` (ENUM: 'pendiente', 'pagado', 'moroso')
8. **`Transacciones_Pasarela`**
   * `id` (UUID, PK)
   * `cobro_unidad_id` (UUID, FK -> Cobros_Unidad)
   * `pasarela` (ENUM: 'flow', 'fintoc', 'mercado_pago', 'webpay', 'transferencia_manual')
   * `token_transaccion` (VARCHAR, Único, Nullable) -> *Token entregado por la API de pago.*
   * `monto_transaccion` (DECIMAL 12,2)
   * `estado_transaccion` (ENUM: 'iniciada', 'exitosa', 'fallida', 'reembolsada')
9. **`Pagos_Registrados`**
   * `id` (UUID, PK)
   * `transaccion_id` (UUID, Nullable, FK -> Transacciones_Pasarela) -> *Enlace a la pasarela si fue pago online.*
   * `cobro_unidad_id` (UUID, FK -> Cobros_Unidad)
   * `monto_pagado` (DECIMAL 12,2)
   * `fecha_pago` (TIMESTAMP)
   * `comprobante_url` (VARCHAR)
10. **`Credenciales_Pago_Condominio`**
    * `id` (UUID, PK)
    * `condominio_id` (UUID, FK -> Condominios)
    * `pasarela` (ENUM: 'flow', 'fintoc', 'mercado_pago')
    * `api_key` (VARCHAR) -> *Debe almacenarse encriptada.*
    * `secret_key` (VARCHAR, Nullable)
    * `activo` (BOOLEAN)

### Módulo 3: Interacción Comunitaria
11. **`Mascotas`**
    * `id` (UUID, PK)
    * `unidad_id` (UUID, FK -> Unidades_Vecinales)
    * `nombre` (VARCHAR)
    * `especie` (VARCHAR)
    * `raza` (VARCHAR, Nullable)
12. **`Publicaciones_Muro`** -> *(Evolución de Avisos_Comunitarios para soportar la red social)*
    * `id` (UUID, PK)
    * `condominio_id` (UUID, FK -> Condominios)
    * `autor_id` (UUID, FK -> Usuarios)
    * `tipo` (ENUM: 'aviso_oficial', 'social', 'mercadito', 'evento', 'encuesta')
    * `titulo` (VARCHAR)
    * `contenido` (TEXT)
    * *Nota Arquitectónica:* Los "likes" y "comentarios" de estas publicaciones vivirán en Firebase Firestore para no saturar PostgreSQL con interacciones rápidas y masivas.
13. **`Mercadito_Items`** -> *(Extensión para publicaciones tipo 'mercadito')*
    * `id` (UUID, PK)
    * `publicacion_id` (UUID, FK -> Publicaciones_Muro)
    * `precio` (DECIMAL 12,2)
    * `estado` (ENUM: 'disponible', 'vendido', 'pausado')
    * `categoria` (ENUM: 'producto', 'servicio')
14. **`Eventos_Comunitarios`** -> *(Extensión para publicaciones tipo 'evento')*
    * `id` (UUID, PK)
    * `publicacion_id` (UUID, FK -> Publicaciones_Muro)
    * `fecha_hora_evento` (TIMESTAMP)
    * `lugar` (VARCHAR)
    * `categoria_evento` (ENUM: 'reunion_oficial', 'actividad_social', 'playdate_mascotas', 'playdate_ninos')
15. **`Registro_Visitas`**
    * `id` (UUID, PK)
    * `unidad_id` (UUID, FK -> Unidades_Vecinales)
    * `rut_visita` (VARCHAR, Nullable) -> *Idealmente validado, pero Nullable para extranjeros o menores.*
    * `nombre_visita` (VARCHAR)
    * `fecha_hora_ingreso` (TIMESTAMP)
    * `patente_vehiculo` (VARCHAR, Nullable)

## 🎯 Entregable Esperado
Genera un único bloque de código SQL (`.sql`) que contenga:
1. La creación de los ENUMs necesarios.
2. La función PL/pgSQL para la validación del RUT (Módulo 11) y el DOMAIN asociado.
3. La creación de todas las tablas con sus respectivas PKs, FKs, tipos de datos correctos y constraints de seguridad.
4. La función y los triggers para la actualización automática de `updated_at`.