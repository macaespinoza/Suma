# Especificación de API: Módulo Perfil (Notificaciones, Seguridad, Ayuda y Soporte)

## Endpoints a Desarrollar por Open Code

### 1. Notificaciones

#### 1.1 `GET /api/usuarios/:usuarioId/notificaciones/configuracion`
Obtiene las preferencias de notificación del usuario.
- **Respuesta Exitosa (200 OK):**
```json
{
  "alertas_gastos_comunes": true,
  "alertas_nuevos_comunicados": true,
  "alertas_mercadito": false,
  "notificaciones_email": true,
  "notificaciones_push": true
}
```

#### 1.2 `PUT /api/usuarios/:usuarioId/notificaciones/configuracion`
Actualiza las preferencias de notificación.
- **Body:**
```json
{
  "alertas_mercadito": true,
  "notificaciones_push": false
}
```

---

### 2. Seguridad

#### 2.1 `GET /api/usuarios/:usuarioId/seguridad/sesiones`
Obtiene el historial de las últimas sesiones activas del usuario por motivos de seguridad.
- **Respuesta Exitosa (200 OK):**
```json
{
  "sesiones": [
    {
      "id": "uuid-sesion-1",
      "dispositivo": "Chrome en Windows",
      "ip": "190.164.2.1",
      "ultima_actividad": "2026-06-11T19:50:00Z",
      "es_actual": true
    },
    {
      "id": "uuid-sesion-2",
      "dispositivo": "Safari en iPhone",
      "ip": "190.164.2.1",
      "ultima_actividad": "2026-06-10T08:15:00Z",
      "es_actual": false
    }
  ]
}
```

#### 2.2 `PUT /api/usuarios/:usuarioId/seguridad/password`
Endpoint para cambiar la contraseña actual.
- **Body:**
```json
{
  "password_actual": "Mypassword123",
  "password_nueva": "NewSecurePass2026",
  "confirmar_password_nueva": "NewSecurePass2026"
}
```

---

### 3. Ayuda y Soporte

#### 3.1 `GET /api/soporte/faq`
Obtiene las preguntas frecuentes de soporte técnico de ComunidApp.
- **Respuesta Exitosa (200 OK):**
```json
{
  "faqs": [
    {
      "pregunta": "¿Cómo recupero mi contraseña?",
      "respuesta": "Puedes recuperar tu contraseña desde la pantalla de inicio..."
    },
    {
      "pregunta": "¿Cómo contacto a mi administrador?",
      "respuesta": "En el módulo de Condominio encontrarás la información..."
    }
  ]
}
```

#### 3.2 `POST /api/soporte/tickets`
Permite al usuario crear un ticket de soporte dirigido al equipo técnico de ComunidApp (no a la administración del condominio).
- **Body:**
```json
{
  "asunto": "Problema al cargar el comprobante",
  "descripcion": "La app se queda en blanco cuando intento subir un PDF en mis pagos.",
  "categoria": "Error Técnico"
}
```

---
**Nota para Open Code:**
Para el prototipo de las vistas Notificaciones, Seguridad, y Ayuda y Soporte, puedes utilizar datos mock en el frontend basados en estos JSON. Las pantallas solo necesitan tener la maquetación visual reflejando estos datos.
