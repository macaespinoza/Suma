# SUMA — Especificación API: Portal Administrativo
## Control de Gastos Comunes, Cobranza y Egresos Operativos

**Versión:** 1.0.0
**Fecha:** 2026-05-31
**Estado:** Borrador
**Autor:** Open Code + Antigravity
**Base de Datos:** PostgreSQL (Cloud SQL)
**Metodología:** Spec-Driven Development (SDD)

---

## 1. Prefacio y Convenciones

### 1.1 Convenciones de la API

| Convención | Valor |
|------------|-------|
| Base URL (Local) | `http://localhost:3001/api/v1` |
| Formato de respuesta | JSON |
| Codificación | UTF-8 |
| Autenticación | Firebase JWT Bearer Token |
| Control de versiones | URL path (`/api/v1/`) |
| Zona horaria | America/Santiago (UTC-4) |

### 1.2 Respuesta Estándar

Toda respuesta exitosa sigue esta estructura:

```json
{
  "ok": true,
  "datos": { ... },
  "meta": {
    "pagina": 1,
    "por_pagina": 20,
    "total": 100
  }
}
```

Toda respuesta de error sigue esta estructura:

```json
{
  "ok": false,
  "error": {
    "codigo": "GASTO_NO_ENCONTRADO",
    "mensaje": "No existe un gasto común para el período especificado.",
    "detalle": { ... }
  }
}
```

### 1.3 Códigos de Error de Negocio

| Código HTTP | Código de Negocio | Descripción |
|-------------|-------------------|-------------|
| 400 | `RUT_INVALIDO` | El RUT no pasó la validación Módulo 11 |
| 400 | `MONTO_NEGATIVO` | El monto no puede ser negativo |
| 400 | `ESTADO_INVALIDO` | Transición de estado no permitida |
| 400 | `GASTO_YA_PUBLICADO` | Intento de modificar un gasto ya publicado |
| 400 | `SALDO_INVALIDO` | El saldo anterior no puede ser negativo |
| 401 | `NO_AUTORIZADO` | Token JWT inválido o expirado |
| 403 | `ROL_INSUFICIENTE` | El usuario no tiene permisos para esta acción |
| 404 | `GASTO_NO_ENCONTRADO` | El gasto común no existe |
| 404 | `COBRO_NO_ENCONTRADO` | El cobro por unidad no existe |
| 409 | `GASTO_MES_DUPLICADO` | Ya existe un gasto para ese mes/condominio |

---

## 2. Endpoints: Gastos Comunes Mensuales

### 2.1 Crear Gasto Común (Borrador)

**POST** `/condominios/{condominioId}/gastos`

Crea un nuevo período de gastos comunes en estado `borrador`. Solo el rol `admin` puede ejecutar esta acción.

**Headers Requeridos:**
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Path Parameters:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| condominioId | UUID | Sí | ID del condominio |

**Request Body:**
```json
{
  "mes_anio": "2026-06-01",
  "total_gastos": 450000.00
}
```

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| mes_anio | string (date) | Sí | Formato ISO `YYYY-MM-DD` | Primer día del mes对应的日期 |
| total_gastos | number | Sí | > 0, max 2 decimales | Total de gastos del mes |

**Respuesta Exitosa (201 Created):**
```json
{
  "ok": true,
  "datos": {
    "id": "55555555-5555-5555-5555-555555555555",
    "condominio_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "mes_anio": "2026-06-01",
    "total_gastos": 450000.00,
    "estado": "borrador",
    "egresos": [],
    "created_at": "2026-05-31T10:00:00Z"
  }
}
```

**Errores:**
- `400 ESTADO_INVALIDO` — mes_anio no es una fecha válida
- `409 GASTO_MES_DUPLICADO` — Ya existe un gasto para ese mes en este condominio
- `403 ROL_INSUFICIENTE` — Usuario no es admin

---

### 2.2 Listar Gastos por Condominio

**GET** `/condominios/{condominioId}/gastos`

Retorna todos los gastos comunes de un condominio, ordenados por mes descendente.

**Path Parameters:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| condominioId | UUID | Sí | ID del condominio |

**Query Parameters:**
| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| pagina | integer | 1 | Número de página |
| por_pagina | integer | 12 | Elementos por página (max 50) |
| estado | string | — | Filtrar por estado (`borrador`, `publicado`) |

**Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "datos": [
    {
      "id": "55555555-5555-5555-5555-555555555555",
      "mes_anio": "2026-05-01",
      "total_gastos": 450000.00,
      "estado": "publicado",
      "total_cobrado": 435000.00,
      "total_pagado": 37485.00,
      "total_pendiente": 397515.00
    }
  ],
  "meta": {
    "pagina": 1,
    "por_pagina": 12,
    "total": 1
  }
}
```

---

### 2.3 Obtener Detalle de Gasto Común

**GET** `/condominios/{condominioId}/gastos/{gastoId}`

Retorna el detalle completo de un gasto común incluyendo sus egresos operativos y el resumen de cobranza por unidad.

**Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "datos": {
    "id": "55555555-5555-5555-5555-555555555555",
    "condominio_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "mes_anio": "2026-05-01",
    "total_gastos": 450000.00,
    "estado": "publicado",
    "egresos_operativos": [
      {
        "id": "e1f2e3e4-e5e6-7890-abcd-ef12345678901",
        "categoria": "Agua",
        "descripcion": "Consumo agua potable mayo 2026",
        "monto": 85000.00
      }
    ],
    "resumen_unidades": {
      "total_unidades": 12,
      "unidades_cobradas": 12,
      "total_cobrado": 450000.00,
      "total_pagado": 37485.00,
      "total_pendiente": 412515.00
    },
    "created_at": "2026-05-01T00:00:00Z",
    "updated_at": "2026-05-15T08:30:00Z"
  }
}
```

---

### 2.4 Actualizar Gasto Común (Borrador Only)

**PATCH** `/condominios/{condominioId}/gastos/{gastoId}`

Actualiza el total de gastos de un período en estado `borrador`. Solo se puede modificar el campo `total_gastos`.

**Request Body:**
```json
{
  "total_gastos": 480000.00
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "datos": {
    "id": "55555555-5555-5555-5555-555555555555",
    "total_gastos": 480000.00,
    "estado": "borrador",
    "updated_at": "2026-05-31T12:00:00Z"
  }
}
```

**Errores:**
- `400 GASTO_YA_PUBLICADO` — No se puede modificar un gasto en estado `publicado`

---

### 2.5 Agregar Egreso Operativo

**POST** `/condominios/{condominioId}/gastos/{gastoId}/egresos`

Agrega un ítem de egreso operativo a un gasto común.

**Request Body:**
```json
{
  "categoria": "Agua",
  "descripcion": "Consumo agua potable mayo 2026",
  "monto": 85000.00
}
```

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| categoria | string | Sí | max 100 chars | Categoría del gasto (Agua, Electricidad, Portería, Mantención, Aseo, Otro) |
| descripcion | string | No | max 500 chars | Descripción detallada |
| monto | number | Sí | > 0 | Monto del egreso |

**Categorías Predefinidas:**
- `Agua`
- `Electricidad`
- `Gas`
- `Portería`
- `Mantención`
- `Aseo`
- `Seguridad`
- `Administración`
- `Seguros`
- `Otro`

**Respuesta Exitosa (201 Created):**
```json
{
  "ok": true,
  "datos": {
    "id": "e1f2e3e4-e5e6-7890-abcd-ef12345678901",
    "gasto_comun_mes_id": "55555555-5555-5555-5555-555555555555",
    "categoria": "Agua",
    "descripcion": "Consumo agua potable mayo 2026",
    "monto": 85000.00,
    "archivo_respaldo_url": null,
    "created_at": "2026-05-31T12:00:00Z"
  }
}
```

---

### 2.6 Listar Egresos por Gasto

**GET** `/condominios/{condominioId}/gastos/{gastoId}/egresos`

Retorna todos los egresos operativos de un gasto común.

**Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "datos": [
    {
      "id": "e1f2e3e4-e5e6-7890-abcd-ef12345678901",
      "categoria": "Agua",
      "descripcion": "Consumo agua potable mayo 2026",
      "monto": 85000.00
    },
    {
      "id": "e2f3e4e5-f6a7-8901-bcde-f123456789012",
      "categoria": "Electricidad",
      "descripcion": "Áreas comunes y pasillos",
      "monto": 62000.00
    }
  ],
  "meta": {
    "total_egresos": 5,
    "suma_egresos": 450000.00
  }
}
```

---

### 2.7 Publicar Gasto y Generar Cobros

**POST** `/condominios/{condominioId}/gastos/{gastoId}/publicar`

Publica un gasto común en estado `borrador`, cambiando su estado a `publicado` y generando automáticamente los cobros por unidad según la fórmula de prorrateo por alícuota.

**Fórmula de Prorrateo:**
```
monto_cobrado = total_gastos × alicuota_de_la_unidad
total_a_pagar = monto_cobrado + saldo_anterior
```

**Reglas de Negocio:**
1. El gasto debe estar en estado `borrador`
2. El total de egresos debe ser menor o igual al total_gastos
3. Se genera un `Cobro_Unidad` por cada unidad activa del condominio
4. El `saldo_anterior` se hereda del último cobro pendiente de la unidad
5. El estado inicial de todos los cobros es `pendiente`

**Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "datos": {
    "gasto": {
      "id": "55555555-5555-5555-5555-555555555555",
      "estado": "publicado",
      "total_gastos": 450000.00
    },
    "cobros_generados": 12,
    "detalle_cobros": [
      {
        "unidad_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "numero": "101",
        "bloque_edificio": "Torre A",
        "alicuota": 0.0833,
        "monto_cobrado": 37485.00,
        "saldo_anterior": 0.00,
        "total_a_pagar": 37485.00,
        "estado_pago": "pendiente"
      }
    ]
  }
}
```

**Errores:**
- `400 GASTO_YA_PUBLICADO` — El gasto ya está publicado
- `400 EGRESOS_SUPERAN_TOTAL` — La suma de egresos excede el total declarado

---

### 2.8 Eliminar Gasto (Borrador Only)

**DELETE** `/condominios/{condominioId}/gastos/{gastoId}`

Elimina un gasto común en estado `borrador` y todos sus egresos asociados. Los cobros solo se eliminan si el gasto está en borrador.

**Respuesta Exitosa (204 No Content)**

**Errores:**
- `400 GASTO_YA_PUBLICADO` — No se puede eliminar un gasto publicado

---

## 3. Endpoints: Cobros por Unidad

### 3.1 Listar Cobros por Gasto Común

**GET** `/condominios/{condominioId}/gastos/{gastoId}/cobros`

Retorna todos los cobros generados para un gasto común específico, con información de la unidad y el residente.

**Query Parameters:**
| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| pagina | integer | 1 | Número de página |
| por_pagina | integer | 20 | Elementos por página |
| estado | string | — | Filtrar por estado (`pendiente`, `pagado`, `moroso`) |
| bloque | string | — | Filtrar por nombre de bloque/edificio |

**Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "datos": [
    {
      "id": "cobro-uuid-001",
      "unidad_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "numero": "101",
      "bloque_edificio": "Torre A",
      "alicuota": 0.0833,
      "monto_cobrado": 37485.00,
      "saldo_anterior": 0.00,
      "total_a_pagar": 37485.00,
      "estado_pago": "pagado",
      "residente_principal": {
        "id": "33333333-3333-3333-3333-333333333333",
        "nombre": "Ana Vargas Pinto",
        "telefono": "+56933333333"
      },
      "ultimo_pago": {
        "fecha": "2026-05-20T14:30:00Z",
        "monto": 37485.00
      }
    }
  ],
  "meta": {
    "pagina": 1,
    "por_pagina": 20,
    "total": 12,
    "resumen": {
      "total_cobrado": 450000.00,
      "total_pagado": 37485.00,
      "total_pendiente": 412515.00,
      "unidades_pagadas": 1,
      "unidades_pendientes": 10,
      "unidades_morosas": 1
    }
  }
}
```

---

### 3.2 Obtener Detalle de Cobro por Unidad

**GET** `/condominios/{condominioId}/cobros/{cobroId}`

Retorna el detalle completo de un cobro individual, incluyendo el historial de pagos y la información del residente.

**Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "datos": {
    "id": "cobro-uuid-002",
    "unidad": {
      "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
      "numero": "102",
      "bloque_edificio": "Torre A",
      "alicuota": 0.0833,
      "propietario": {
        "id": "22222222-2222-2222-2222-222222222222",
        "nombre": "Carlos Muñoz Rojas",
        "email": "carlos.munoz@email.cl"
      },
      "residentes": [
        {
          "id": "33333333-3333-3333-3333-333333333333",
          "nombre": "Ana Vargas Pinto",
          "telefono": "+56933333333",
          "es_residente": true
        }
      ]
    },
    "gasto_comun": {
      "id": "55555555-5555-5555-5555-555555555555",
      "mes_anio": "2026-05-01",
      "total_gastos": 450000.00
    },
    "monto_cobrado": 37485.00,
    "saldo_anterior": 15000.00,
    "total_a_pagar": 52485.00,
    "estado_pago": "pendiente",
    "historial_pagos": [
      {
        "id": "pago-uuid-001",
        "fecha": "2026-04-10T10:00:00Z",
        "monto": 30000.00,
        "comprobante_url": "https://storage.cloud.google.com/..."
      }
    ]
  }
}
```

---

### 3.3 Actualizar Estado de Pago (Manual)

**PATCH** `/condominios/{condominioId}/cobros/{cobroId}/estado`

Permite a un admin cambiar manualmente el estado de un cobro. Usado para marcar como `pagado` cuando el pago fue realizado en efectivo o transferencia manual sin usar pasarela.

**Request Body:**
```json
{
  "estado_pago": "pagado",
  "nota": "Pago recibido en efectivo el 28 de mayo"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| estado_pago | string | Sí | `pendiente`, `pagado`, `moroso` |
| nota | string | No | Nota interna sobre el cambio de estado |

**Transiciones de Estado Permitidas:**
```
borrador → pendiente (al publicar)
pendiente → pagado
pendiente → moroso (si pasan 30 días sin pago)
moroso → pendiente (si se pacta acuerdo de pago)
moroso → pagado
pagado → pendiente (en caso de reembolso)
```

**Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "datos": {
    "id": "cobro-uuid-002",
    "estado_pago": "pagado",
    "updated_at": "2026-05-31T15:00:00Z"
  }
}
```

**Errores:**
- `400 ESTADO_INVALIDO` — La transición de estado no está permitida

---

## 4. Endpoints: Pagos

### 4.1 Registrar Pago Manual

**POST** `/condominios/{condominioId}/cobros/{cobroId}/pagos`

Registra un pago realizado manualmente por el admin (efectivo, transferencia sin pasarela).

**Request Body:**
```json
{
  "monto_pagado": 52485.00,
  "fecha_pago": "2026-05-28T10:00:00Z",
  "comprobante_url": "https://storage.cloud.google.com/..."
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| monto_pagado | number | Sí | Monto del pago (debe ser >= total_a_pagar para marcar como pagado) |
| fecha_pago | string (datetime) | Sí | Fecha y hora del pago |
| comprobante_url | string | No | URL del comprobante en Cloud Storage |

**Reglas de Negocio:**
- Si `monto_pagado >= total_a_pagar`, el estado del cobro cambia a `pagado`
- Si `monto_pagado < total_a_pagar`, se genera un nuevo saldo para el mes siguiente
- Se crea un registro en `Pagos_Registrados`
- El `transaccion_id` es NULL para pagos manuales

**Respuesta Exitosa (201 Created):**
```json
{
  "ok": true,
  "datos": {
    "pago": {
      "id": "pago-uuid-003",
      "cobro_unidad_id": "cobro-uuid-002",
      "monto_pagado": 52485.00,
      "fecha_pago": "2026-05-28T10:00:00Z",
      "transaccion_id": null,
      "comprobante_url": "https://storage.cloud.google.com/..."
    },
    "cobro_actualizado": {
      "id": "cobro-uuid-002",
      "estado_pago": "pagado",
      "total_a_pagar": 0.00
    }
  }
}
```

---

### 4.2 Listar Pagos por Condominio y Período

**GET** `/condominios/{condominioId}/pagos`

Retorna todos los pagos registrados de un condominio, con filtros por período.

**Query Parameters:**
| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| pagina | integer | 1 | Número de página |
| por_pagina | integer | 20 | Elementos por página |
| mes_anio | string | — | Filtrar por mes (formato `YYYY-MM-DD`) |
| unidad_id | UUID | — | Filtrar por unidad específica |

**Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "datos": [
    {
      "id": "pago-uuid-003",
      "cobro_unidad_id": "cobro-uuid-002",
      "unidad": {
        "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
        "numero": "102",
        "bloque_edificio": "Torre A"
      },
      "monto_pagado": 52485.00,
      "fecha_pago": "2026-05-28T10:00:00Z",
      "pasarela": null,
      "comprobante_url": "https://storage.cloud.google.com/..."
    }
  ],
  "meta": {
    "pagina": 1,
    "por_pagina": 20,
    "total": 1,
    "total_monto_pagado": 52485.00
  }
}
```

---

### 4.3 Webhook de Confirmación de Pago (Pasarela)

**POST** `/webhooks/pagos/{pasarela}`

Endpoint recibir notifications de pago desde pasarelas externas (Flow, Fintoc, MercadoPago).

**Headers Requeridos:**
```
Content-Type: application/json
X-Pasarela-Signature: <firma_del_webhook>
```

**Request Body (Flow):**
```json
{
  "token": "abc123def456",
  "status": 2,
  "amount": 52485,
  "currency": "CLP",
  "order": "cobro-uuid-002",
  "environment": "production"
}
```

| Campo | Descripción |
|-------|-------------|
| token | Token único de la transacción en la pasarela |
| status | 1=iniciada, 2=exitosa, 3=fallida, 4=reembolsada |
| amount | Monto de la transacción |
| order | ID del cobro_unidad en nuestra BD |
| environment | `production` o `integration` |

**Reglas de Negocio:**
1. Validar firma del webhook contra el secret de la pasarela
2. Buscar la transacción por `token_transaccion`
3. Actualizar estado de la transacción
4. Si `status=2` (exitosa), actualizar el cobro a `pagado` y crear `Pagos_Registrados`
5. Responder 200 OK solo si el webhook fue procesado correctamente

**Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "mensaje": "Pago procesado correctamente"
}
```

---

## 5. Endpoints: Transacciones de Pasarela

### 5.1 Iniciar Transacción de Pago

**POST** `/condominios/{condominioId}/cobros/{cobroId}/transacciones`

Inicia el proceso de pago online a través de una pasarela configurada.

**Request Body:**
```json
{
  "pasarela": "flow",
  "url_retorno": "https://comunidapp.cl/condominio/1/gastos/mes/5/pago/exitoso",
  "url_cancelar": "https://comunidapp.cl/condominio/1/gastos/mes/5/pago/cancelado"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| pasarela | string | Sí | `flow`, `fintoc`, `mercado_pago` |
| url_retorno | string | Sí | URL a la que redirige la pasarela tras pago exitoso |
| url_cancelar | string | Sí | URL a la que redirige la pasarela si el usuario cancela |

**Respuesta Exitosa (201 Created):**
```json
{
  "ok": true,
  "datos": {
    "transaccion": {
      "id": "tx-uuid-001",
      "cobro_unidad_id": "cobro-uuid-002",
      "pasarela": "flow",
      "token_transaccion": "T1234567890",
      "monto_transaccion": 52485.00,
      "estado_transaccion": "iniciada"
    },
    "url_pasarela": "https://www.flow.cl/pay/T1234567890",
    "expires_at": "2026-05-31T23:59:59Z"
  }
}
```

---

### 5.2 Consultar Estado de Transacción

**GET** `/condominios/{condominioId}/transacciones/{transaccionId}`

Consulta el estado actual de una transacción con la pasarela.

**Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "datos": {
    "id": "tx-uuid-001",
    "cobro_unidad_id": "cobro-uuid-002",
    "pasarela": "flow",
    "token_transaccion": "T1234567890",
    "monto_transaccion": 52485.00,
    "estado_transaccion": "exitosa",
    "flow_status_detail": 0,
    "flow_fecha_pago": "2026-05-31T14:30:00Z"
  }
}
```

---

### 5.3 Obtener URL de Pago

**GET** `/condominios/{condominioId}/transacciones/{transaccionId}/url`

Retorna la URL de pago activa para continuar con el proceso de pago.

**Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "datos": {
    "url_pasarela": "https://www.flow.cl/pay/T1234567890",
    "expires_at": "2026-05-31T23:59:59Z"
  }
}
```

---

## 6. Endpoints: Configuración de Pasarelas

### 6.1 Guardar Credenciales de Pasarela

**POST** `/condominios/{condominioId}/pasarelas`

Almacena las credenciales de API de una pasarela de pago para el condominio. **CRÍTICO:** Los valores de `api_key` y `secret_key` son encriptados con AES-256 en el backend antes de almacenarse.

**Request Body:**
```json
{
  "pasarela": "flow",
  "api_key": "encrypted_value_here",
  "secret_key": "encrypted_value_here"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| pasarela | string | Sí | `flow`, `fintoc`, `mercado_pago` |
| api_key | string | Sí | API Key de la pasarela |
| secret_key | string | Sí | Secret Key de la pasarela |

**Respuesta Exitosa (201 Created):**
```json
{
  "ok": true,
  "datos": {
    "id": "credencial-uuid-001",
    "condominio_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "pasarela": "flow",
    "activo": true,
    "created_at": "2026-05-31T12:00:00Z"
  }
}
```

**Errores:**
- `400 PASARELA_DUPLICADA` — Ya existe una credencial para esta pasarela en este condominio

---

### 6.2 Listar Pasarelas Configuradas

**GET** `/condominios/{condominioId}/pasarelas`

Retorna las pasarelas de pago configuradas para el condominio.

**Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "datos": [
    {
      "id": "credencial-uuid-001",
      "pasarela": "flow",
      "activo": true,
      "created_at": "2026-05-31T12:00:00Z"
    }
  ]
}
```

---

### 6.3 Activar/Desactivar Pasarela

**PATCH** `/condominios/{condominioId}/pasarelas/{pasarelaId}`

Activa o desactiva una pasarela de pago configurada.

**Request Body:**
```json
{
  "activo": false
}
```

---

## 7. Dashboard Resumen (Admin)

### 7.1 Resumen Financiero del Condominio

**GET** `/condominios/{condominioId}/dashboard/financiero`

Retorna un resumen ejecutivo de la situación financiera del condominio.

**Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "datos": {
    "periodo_actual": {
      "mes_anio": "2026-05-01",
      "total_gastos": 450000.00,
      "total_cobrado": 450000.00,
      "total_pagado": 37485.00,
      "total_pendiente": 412515.00,
      "tasa_recaudacion": 8.33
    },
    "estado_cuenta": {
      "unidades_activas": 12,
      "pagadas": 1,
      "pendientes": 10,
      "morosas": 1
    },
    "deuda_historica": {
      "total_deuda_anterior": 15000.00,
      "total_pagado_mes_anterior": 30000.00,
      "deuda_reciente": 15000.00
    },
    "egresos_mes": {
      "total": 450000.00,
      "por_categoria": {
        "Agua": 85000.00,
        "Electricidad": 62000.00,
        "Portería": 180000.00,
        "Mantención": 45000.00,
        "Aseo": 78000.00
      }
    },
    "pasarelas_activas": ["flow"]
  }
}
```

---

## 8. Modelos de Datos (Referencias)

### 8.1 Gastos_Comunes_Mes
```typescript
interface GastosComunesMes {
  id: string;                    // UUID
  condominio_id: string;         // UUID
  mes_anio: string;              // Date (YYYY-MM-DD)
  total_gastos: number;         // Decimal(12,2)
  estado: 'borrador' | 'publicado';
  created_at: string;           // Timestamp
  updated_at: string;           // Timestamp
}
```

### 8.2 Egresos_Operativos
```typescript
interface EgresosOperativos {
  id: string;                   // UUID
  gasto_comun_mes_id: string;   // UUID
  categoria: string;           // Enum predefined
  descripcion: string;          // Text
  monto: number;                // Decimal(12,2)
  archivo_respaldo_url: string; // Nullable
  created_at: string;
  updated_at: string;
}
```

### 8.3 Cobros_Unidad
```typescript
interface CobrosUnidad {
  id: string;                  // UUID
  unidad_id: string;           // UUID
  gasto_comun_mes_id: string;  // UUID
  monto_cobrado: number;       // Decimal(12,2)
  saldo_anterior: number;      // Decimal(12,2)
  total_a_pagar: number;       // Decimal(12,2)
  estado_pago: 'pendiente' | 'pagado' | 'moroso';
  created_at: string;
  updated_at: string;
}
```

### 8.4 Transacciones_Pasarela
```typescript
interface TransaccionesPasarela {
  id: string;                       // UUID
  cobro_unidad_id: string;          // UUID
  pasarela: 'flow' | 'fintoc' | 'mercado_pago' | 'webpay' | 'transferencia_manual';
  token_transaccion: string;        // Unique
  monto_transaccion: number;        // Decimal(12,2)
  estado_transaccion: 'iniciada' | 'exitosa' | 'fallida' | 'reembolsada';
  created_at: string;
  updated_at: string;
}
```

### 8.5 Pagos_Registrados
```typescript
interface PagosRegistrados {
  id: string;                // UUID
  cobro_unidad_id: string;  // UUID
  transaccion_id: string;    // Nullable UUID
  monto_pagado: number;      // Decimal(12,2)
  fecha_pago: string;        // Timestamp
  comprobante_url: string;   // Nullable
  created_at: string;
  updated_at: string;
}
```

---

## 9. Reglas de Autorización por Rol

| Endpoint | admin | propietario | arrendatario | conserje |
|----------|-------|-------------|--------------|----------|
| Crear/Editar/Publicar Gasto | ✅ | ❌ | ❌ | ❌ |
| Agregar Egreso | ✅ | ❌ | ❌ | ❌ |
| Listar Gastos del Condominio | ✅ | ✅ | ✅ | ❌ |
| Ver Detalle de Gasto | ✅ | ✅ | ✅ | ❌ |
| Ver Estado de Pago (propia unidad) | ✅ | ✅ | ✅ | ❌ |
| Ver Estado de Pago (todas unidades) | ✅ | ❌ | ❌ | ❌ |
| Registrar Pago Manual | ✅ | ❌ | ❌ | ❌ |
| Marcar Cobro como Pagado | ✅ | ❌ | ❌ | ❌ |
| Iniciar Transacción Online | ✅ | ✅ | ✅ | ❌ |
| Configurar Pasarelas | ✅ | ❌ | ❌ | ❌ |
| Ver Dashboard Financiero | ✅ | ❌ | ❌ | ❌ |
| Registrar Visita | ✅ | ❌ | ❌ | ✅ |

---

## 10. Anexos

### 10.1 Códigos de Error Completos

| Código | HTTP | Descripción |
|--------|------|-------------|
| `RUT_INVALIDO` | 400 | El RUT no pasó validación Módulo 11 |
| `MONTO_NEGATIVO` | 400 | Monto no puede ser negativo |
| `MONTO_INVALIDO` | 400 | Monto con más de 2 decimales |
| `ESTADO_INVALIDO` | 400 | Transición de estado no permitida |
| `GASTO_YA_PUBLICADO` | 400 | Gasto en estado published no permite modificaciones |
| `SALDO_INVALIDO` | 400 | Saldo anterior no puede ser negativo |
| `EGRESOS_SUPERAN_TOTAL` | 400 | Suma de egresos excede el total declarado |
| `PASARELA_DUPLICADA` | 400 | Ya existe credencial para esta pasarela |
| `GASTO_MES_DUPLICADO` | 409 | Ya existe un gasto para ese mes en este condominio |
| `COBRO_MES_DUPLICADO` | 409 | Ya existe un cobro para esa unidad en ese mes |
| `NO_AUTORIZADO` | 401 | Token JWT inválido o expirado |
| `ROL_INSUFICIENTE` | 403 | Usuario no tiene el rol requerido |
| `GASTO_NO_ENCONTRADO` | 404 | El gasto común no existe |
| `COBRO_NO_ENCONTRADO` | 404 | El cobro por unidad no existe |
| `TRANSACCION_NO_ENCONTRADA` | 404 | La transacción no existe |
| `UNIDAD_NO_ENCONTRADA` | 404 | La unidad no existe |
| `CONDOMINIO_NO_ENCONTRADO` | 404 | El condominio no existe |
| `VALIDACION_FALLIDA` | 422 | Error de validación de campos |

---

**FIN DEL DOCUMENTO — Portal Administrativo v1.0.0**
