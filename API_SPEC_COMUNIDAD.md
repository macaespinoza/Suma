# Especificación de API: Módulo Comunidad (Muro y Mercadito)

## Endpoints a Desarrollar por Open Code

### 1. Muro (Anteriormente Feed)

#### 1.1 `GET /api/condominios/:condominioId/muro/publicaciones`
Obtiene el listado paginado de publicaciones en el Muro del condominio.
- **Respuesta Exitosa (200 OK):**
```json
{
  "publicaciones": [
    {
      "id": "uuid-publicacion",
      "autor": {
        "id": "uuid-usuario",
        "nombre": "Administración",
        "avatar": "url_to_avatar"
      },
      "contenido": "Estimados vecinos, se informa que el corte de agua será a las 15:00 hrs.",
      "fecha_creacion": "2026-06-11T10:00:00Z",
      "cantidad_comentarios": 5,
      "me_gusta": 12
    }
  ],
  "paginacion": {
    "total": 50,
    "pagina": 1,
    "limite": 10
  }
}
```

#### 1.2 `GET /api/condominios/:condominioId/muro/publicaciones/:publicacionId/comentarios`
Obtiene los comentarios de una publicación específica.
- **Respuesta Exitosa (200 OK):**
```json
{
  "comentarios": [
    {
      "id": "uuid-comentario",
      "autor": {
        "id": "uuid-usuario",
        "nombre": "Pedro Rojas"
      },
      "contenido": "Gracias por el aviso, tomaremos precauciones.",
      "fecha_creacion": "2026-06-11T10:30:00Z"
    }
  ]
}
```

#### 1.3 `POST /api/condominios/:condominioId/muro/publicaciones/:publicacionId/comentarios`
Añade un nuevo comentario a una publicación.
- **Body:**
```json
{
  "contenido": "Enterado, muchas gracias."
}
```

---

### 2. Mercadito

#### 2.1 `GET /api/condominios/:condominioId/mercadito/productos`
Obtiene los productos o servicios publicados en el Mercadito del condominio.
- **Respuesta Exitosa (200 OK):**
```json
{
  "productos": [
    {
      "id": "uuid-producto",
      "vendedor": {
        "id": "uuid-usuario",
        "nombre": "Ana Silva",
        "unidad": "Depto 402"
      },
      "titulo": "Vendo Bicicleta Aro 26",
      "descripcion": "Bicicleta en excelente estado, poco uso.",
      "precio": 85000,
      "imagenes": [
        "https://via.placeholder.com/400x300?text=Bicicleta+Placeholder"
      ],
      "fecha_publicacion": "2026-06-10T15:00:00Z",
      "cantidad_comentarios": 2,
      "estado": "activo"
    }
  ]
}
```

#### 2.2 `GET /api/condominios/:condominioId/mercadito/productos/:productoId/comentarios`
Obtiene las preguntas o comentarios de un producto en venta.
- **Respuesta Exitosa (200 OK):**
```json
{
  "comentarios": [
    {
      "id": "uuid-comentario",
      "autor": {
        "id": "uuid-usuario",
        "nombre": "Luis Pérez"
      },
      "contenido": "¿Aún está disponible? ¿El precio es conversable?",
      "fecha_creacion": "2026-06-11T09:00:00Z",
      "respuesta_vendedor": null
    }
  ]
}
```

#### 2.3 `POST /api/condominios/:condominioId/mercadito/productos/:productoId/comentarios`
Publica una pregunta en el producto del Mercadito.
- **Body:**
```json
{
  "contenido": "¿Haces entregas en la portería?"
}
```

---
**Nota para Open Code:**
Para esta etapa de prototipo, debes crear mock data que respete esta estructura JSON e integrarlo en la interfaz (Muro y Mercadito), asegurando de proveer placeholders visuales cuando se requieran imágenes.
