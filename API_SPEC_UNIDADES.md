# Especificación de API: Ficha Administrativa de Unidades (Titulares y Vehículos)

## Endpoints Nuevos a Desarrollar por Open Code

### 1. `GET /api/condominios/:condominioId/unidades/:unidadId`
Obtiene los detalles completos de una unidad, incluyendo sus titulares, vehículos y mascotas.
- **Respuesta Exitosa (200 OK):**
```json
{
  "id": "uuid-unidad",
  "numero": "101",
  "tiene_estacionamiento": true,
  "numero_estacionamiento": "E-12",
  "tiene_bodega": true,
  "numero_bodega": "B-5",
  "titulares": [
    {
      "id": "uuid-titular",
      "tipo": "propietario",
      "nombre": "Juan Pérez",
      "rut": "12345678-5",
      "email": "juan@email.com",
      "telefono": "+56912345678"
    }
  ],
  "vehiculos": [
    {
      "id": "uuid-vehiculo",
      "tipo_vehiculo": "Auto",
      "patente": "ABCD12"
    }
  ],
  "mascotas": []
}
```

### 2. `PUT /api/condominios/:condominioId/unidades/:unidadId`
Actualiza datos base de la unidad.
- **Body:**
```json
{
  "tiene_estacionamiento": true,
  "numero_estacionamiento": "E-12",
  "tiene_bodega": false,
  "numero_bodega": null
}
```

### 3. `POST /api/condominios/:condominioId/unidades/:unidadId/titulares`
Añade o reemplaza un titular (propietario o arrendatario). Si ya existe un titular activo de ese `tipo`, debe actualizarse.
- **Body:**
```json
{
  "tipo": "propietario", // o "arrendatario"
  "nombre": "María Gómez",
  "rut": "11222333-4",
  "email": "maria@email.com",
  "telefono": "+56987654321"
}
```

### 4. `DELETE /api/condominios/:condominioId/unidades/:unidadId/titulares/:titularId`
Elimina administrativamente a un titular de la unidad.

### 5. `POST /api/condominios/:condominioId/unidades/:unidadId/vehiculos`
Añade un vehículo a la unidad.
- **Body:**
```json
{
  "tipo_vehiculo": "Moto",
  "patente": "XYZ99"
}
```

### 6. `DELETE /api/condominios/:condominioId/unidades/:unidadId/vehiculos/:vehiculoId`
Elimina un vehículo de la unidad.

---
**Nota para Open Code:**
Recuerda que `tiene_estacionamiento` y `tiene_bodega` son requeridos (BOOLEAN NOT NULL DEFAULT FALSE), mientras que `numero_estacionamiento` y `numero_bodega` son opcionales (VARCHAR).
