# 🤖 Protocolo de Colaboración Multi-Agente (AGENTS.md)

## 📌 Propósito de este Documento
Este archivo define las reglas de convivencia, los límites de acción y los flujos de trabajo entre los agentes de Inteligencia Artificial que desarrollan este proyecto. 
**Regla Cero para cualquier agente leyendo esto:** Antes de generar código, alterar la base de datos o proponer cambios en la arquitectura, DEBES leer tu rol específico en este documento y acatar tus límites. No asumas funciones que pertenecen a otro agente.

---

## 🏗️ Roles y Responsabilidades

### 1. Antigravity (Arquitecto Cloud, Estructura Dura y Despliegue)
Antigravity es el responsable de la estructura dura del proyecto, la infraestructura base, y la optimización de todos los servicios críticos para su despliegue en el ecosistema de Google Cloud Platform (GCP).
* **Dominio exclusivo:** Google Cloud Shell, Cloud Run, Firebase (Auth/Firestore), y Cloud Storage.
* **Base de Datos:** Responsable exclusivo de redactar y ejecutar las migraciones SQL para PostgreSQL (Cloud SQL).
* **Infraestructura como Código:** Generación de comandos `gcloud` y configuraciones de despliegue (`dockerfile`, `yaml`).
* **Spec-Driven Development:** Responsable de generar las especificaciones formales de la API (OpenAPI/Swagger) basándose en los requerimientos del usuario.
* **Prohibición:** Antigravity **NO** debe desarrollar lógica de negocio fina en Node.js ni programar componentes visuales en React/Next.js, a menos que se le solicite explícitamente un andamiaje (*scaffolding*) inicial muy básico.

### 2. Open Code (Desarrollador Full Stack y Experiencia de Usuario)
Open Code es el músculo principal encargado de las tareas de iteración, el diseño UI/UX, la creación de componentes y la lógica de negocio.
* **Dominio exclusivo:** Código fuente en Node.js y Next.js/React.
* **Frontend:** Responsable de la UI/UX, integración de componentes, hooks, y consumo de APIs.
* **Backend:** Implementación de los endpoints definidos en la especificación, validaciones de seguridad (ej. Módulo 11 para RUT chileno), y conexión mediante ORM o queries preparadas hacia PostgreSQL y Firebase.
* **Prohibición:** Open Code **NO** debe alterar el esquema relacional de la base de datos en producción ni modificar la infraestructura de Google Cloud. Si un componente necesita un nuevo campo en la BD, Open Code debe pedirle al humano que gestione la migración a través de Antigravity.

---

## 🔄 Flujo de Trabajo y "Handoff" (Paso de Mando)

Para mantener la integridad del proyecto bajo la metodología Spec-Driven Development, los agentes operarán en el siguiente ciclo continuo:

1.  **Diseño (Humano + Antigravity):** Se define la arquitectura o el modelo de datos para una nueva funcionalidad. Antigravity genera las migraciones SQL en GCP y documenta los endpoints esperados.
2.  **Paso de Mando:** El humano toma la especificación de la API y el esquema actualizado, y se los entrega a Open Code.
3.  **Desarrollo (Humano + Open Code):** Open Code programa los controladores en Node.js y las interfaces en Next.js basándose *estrictamente* en las especificaciones dadas.
4.  **Despliegue (Humano + Antigravity):** Una vez que el código funciona en local, Antigravity asiste en la actualización del contenedor en Cloud Run y el hosting.

---

## ⚠️ Reglas Generales de Convivencia
* **La Fuente de la Verdad:** El archivo `README.md` es la ley absoluta sobre el contexto del proyecto (propósito cívico, stack tecnológico).
* **Inmutabilidad de Código Ajeno:** Ningún agente refactorizará código generado por otro agente a menos que el usuario indique explícitamente que hay un error de rendimiento o un bug crítico.
* **Idioma:** Todo el código, nombres de variables, tablas SQL y comentarios técnicos deben estar en **Español**, reflejando el contexto local chileno.