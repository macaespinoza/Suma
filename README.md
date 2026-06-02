# 🏢 Plataforma PropTech de Gestión y Cohesión Comunitaria

## 📌 Visión del Proyecto
Esta plataforma es una solución tecnológica regional desarrollada desde y para Arica, Chile. Su objetivo trasciende la simple administración inmobiliaria; busca fomentar la cohesión social, la economía circular y la vida cívica en condominios y comunidades de tamaño pequeño a mediano.

El proyecto está diseñado bajo un modelo **SaaS (Software as a Service)** con potencial de postulación a fondos públicos de innovación social (GORE, CORFO, Sercotec), demostrando escalabilidad y un alto impacto territorial.

---

## 🏗️ Arquitectura de la Aplicación
La plataforma se divide lógicamente en tres ramas principales conectadas por un núcleo de datos:

1. **El Núcleo (Core):** Gestión de propiedades, distribución física (edificios/bloques característicos de Arica) e identidad validada de los usuarios (RUT chileno).
2. **Portal Administrativo:** Motor contable para el cálculo y prorrateo de gastos comunes (conforme a la Ley N° 21.442, permitiendo la asignación y cálculo automático de alícuotas según los metros cuadrados de cada unidad), emisión de cobros, registro de pagos y gestión de egresos operativos.
3. **Portal Comunitario:** Red social interna del condominio, avisos de utilidad pública, red de apoyo vecinal, economía circular (emprendimientos locales) y registro *pet-friendly*.

---

## 💻 Stack Tecnológico (Google Cloud + JavaScript)
El desarrollo sigue una arquitectura Full Stack JavaScript orientada a la escalabilidad, utilizando los servicios nativos de Google Cloud Platform (GCP).

* **Frontend Web:** Next.js (React.js) para un SSR rápido, SEO optimizado y creación ágil de componentes de UI. Despliegue mediante Cloud Run o Firebase Hosting.
* **Backend / API:** Node.js, empaquetado en contenedores y orquestado mediante Google Cloud Run (escalabilidad a cero y alta disponibilidad).
* **Base de Datos Principal:** Google Cloud SQL (PostgreSQL). Motor relacional estricto para garantizar la integridad contable y estructural.
* **Autenticación y Tiempo Real:** Firebase Authentication y Firestore (exclusivamente para chat, notificaciones push y operaciones no relacionales).
* **Almacenamiento de Archivos:** Google Cloud Storage para PDFs (ley de copropiedad, comprobantes) e imágenes (mascotas, incidentes).

---

## 🧠 Metodología: Spec-Driven Development (SDD)
Este proyecto no se programa "al vuelo". Se rige bajo la metodología SDD para garantizar el orden en el ecosistema Multi-Agente:
1. **Diseño de Datos Primero:** Ninguna interfaz se programa sin que el esquema relacional en PostgreSQL esté definido y validado.
2. **Especificación de API (OpenAPI):** Los contratos de datos entre Frontend y Backend se definen antes de escribir los controladores.
3. **Desarrollo Iterativo:** El frontend consume datos *mockeados* basados en la especificación mientras el backend termina su implementación.

> ⚠️ **Nota para Agentes de IA (Open Code / Antigravity):** Antes de ejecutar cualquier acción en este repositorio, debes leer el archivo `AGENTS.md` para conocer tus límites, permisos y el flujo de colaboración. Recuerda: Antigravity se enfoca en la estructura dura, optimización y despliegue (GCP, BD, Backend Core), mientras que Open Code lidera las tareas de iteración, diseño, componentes UI y lógica de negocio frontend.

---

## 🇨🇱 Reglas de Negocio Locales (Contexto Chile/Arica)
Cualquier agente o desarrollador trabajando en esta base de código debe respetar las siguientes normativas:
* **El RUT es Mandatorio:** El Rol Único Tributario (RUT) es el identificador principal. Debe validarse estrictamente a través del algoritmo de "Módulo 11" tanto en el backend (Node.js) como en la base de datos (PostgreSQL).
* **Agrupación Territorial:** En Arica es común que los condominios se dividan en múltiples edificios, torres o bloques pequeños. La base de datos y la UI deben reflejar y soportar esta distribución (`bloque_edificio`).
* **Ley de Copropiedad N° 21.442:** El cálculo y distribución de los gastos comunes (alícuota) se rige bajo la Ley N° 21.442. El sistema permite la asignación de metros cuadrados (`metros_cuadrados`) a cada unidad y cuenta con un algoritmo de prorrateo que calcula automáticamente las alícuotas correspondientes, compensando el redondeo decimal en la última unidad para asegurar que la suma de alícuotas sea exactamente `1.0000` (100%).
* **Idioma:** El código, variables, comentarios y esquema de base de datos están escritos íntegramente en Español.