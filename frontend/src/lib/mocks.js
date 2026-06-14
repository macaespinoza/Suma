// =============================================================================
// SUMA — Mock Data para Prototipo
// Datos estáticos para simular el backend en el entorno de demostración (Corfo).
// =============================================================================

export const MOCK_CONDOMINIOS = [
  { id: 'condo-chimchorro', nombre: 'Condominio Chinchorro', direccion: 'Av. Chinchorro 450, Arica', estado: 'activo', unidades_totales: 48, fondo_reserva: 3500000, creado_en: '2024-01-15T10:00:00Z' },
  { id: 'condo-1', nombre: 'Condominio Alta Vista', direccion: 'Av. Las Palmas 1234, Arica', estado: 'activo', unidades_totales: 120, fondo_reserva: 2500000, creado_en: new Date().toISOString() },
];

const MOCK_GASTOS = [
  { id: 'gasto-jun-2026', condominio_id: 'condo-chimchorro', mes_anio: '2026-06-01', total_gastos: 1840000, estado: 'publicado' },
  { id: 'gasto-may-2026', condominio_id: 'condo-chimchorro', mes_anio: '2026-05-01', total_gastos: 1790000, estado: 'publicado' },
  { id: 'gasto-abr-2026', condominio_id: 'condo-chimchorro', mes_anio: '2026-04-01', total_gastos: 1820000, estado: 'publicado' },
  { id: 'gasto-borrador', condominio_id: 'condo-chimchorro', mes_anio: '2026-07-01', total_gastos: 0, estado: 'borrador' },
];

const MOCK_EGRESOS = {
  'gasto-jun-2026': [
    { id: 'egr-1', categoria: 'Agua', descripcion: 'Consumo agua potable junio 2026', monto: 520000 },
    { id: 'egr-2', categoria: 'Electricidad', descripcion: 'Electricidad áreas comunes', monto: 380000 },
    { id: 'egr-3', categoria: 'Portería', descripcion: 'Servicio de conserjería', monto: 480000 },
    { id: 'egr-4', categoria: 'Mantención', descripcion: 'Mantención ascensor', monto: 220000 },
    { id: 'egr-5', categoria: 'Aseo', descripcion: 'Servicio de limpieza', monto: 180000 },
    { id: 'egr-6', categoria: 'Otro', descripcion: 'Varios y suministros', monto: 60000 },
  ],
};

const MOCK_COBROS = {
  'gasto-jun-2026': [
    { id: 'cob-1', unidad_id: 'uni-101', numero: '101', bloque_edificio: 'Bloque A', alicuota: 0.0215, monto_cobrado: 39520, saldo_anterior: 0, total_a_pagar: 39520, estado_pago: 'pagado', monto_total: 39520 },
    { id: 'cob-2', unidad_id: 'uni-102', numero: '102', bloque_edificio: 'Bloque A', alicuota: 0.0215, monto_cobrado: 39520, saldo_anterior: 0, total_a_pagar: 39520, estado_pago: 'pagado', monto_total: 39520 },
    { id: 'cob-3', unidad_id: 'uni-103', numero: '103', bloque_edificio: 'Bloque A', alicuota: 0.0200, monto_cobrado: 36800, saldo_anterior: 0, total_a_pagar: 36800, estado_pago: 'pendiente', monto_total: 36800 },
    { id: 'cob-4', unidad_id: 'uni-201', numero: '201', bloque_edificio: 'Bloque B', alicuota: 0.0220, monto_cobrado: 40480, saldo_anterior: 0, total_a_pagar: 40480, estado_pago: 'pagado', monto_total: 40480 },
    { id: 'cob-5', unidad_id: 'uni-202', numero: '202', bloque_edificio: 'Bloque B', alicuota: 0.0210, monto_cobrado: 38640, saldo_anterior: 38500, total_a_pagar: 77140, estado_pago: 'moroso', monto_total: 77140 },
    { id: 'cob-6', unidad_id: 'uni-203', numero: '203', bloque_edificio: 'Bloque B', alicuota: 0.0210, monto_cobrado: 38640, saldo_anterior: 0, total_a_pagar: 38640, estado_pago: 'pendiente', monto_total: 38640 },
  ],
};

const MOCK_DASHBOARD = {
  'condo-chimchorro': {
    periodo_actual: { mes_anio: '2026-06-01', total_gastos: 1840000, total_cobrado: 1840000, total_pagado: 1472000, total_pendiente: 368000, tasa_recaudacion: 80.0 },
    estado_cuenta: { unidades_activas: 48, pagadas: 38, pendientes: 7, morosas: 3 },
    deuda_historica: { total_deuda_anterior: 115200, total_pagado_mes_anterior: 1612000, deuda_reciente: 38500 },
    egresos_mes: { total: 1840000, por_categoria: { Agua: 520000, Electricidad: 380000, Portería: 480000, Mantención: 220000, Aseo: 180000, Otro: 60000 } },
    pasarelas_activas: ['flow'],
  },
};

// =============================================================================
// MÓDULO: MASCOTAS (Pet-Friendly)
// =============================================================================
const MOCK_MASCOTAS = [
  { id: 'masc-1', nombre: 'Luna', especie: 'Perro', raza: 'Beagle', edad: '4 años', color: 'Tricolor', peso: '12 kg', sexo: 'Hembra', esterilizado: true, vacunas_al_dia: true, foto: null, dueno: { id: 'usr-2', nombre: 'María González', unidad: 'B-204' }, created_at: '2025-03-15T10:00:00Z' },
  { id: 'masc-2', nombre: 'Max', especie: 'Perro', raza: 'Golden Retriever', edad: '2 años', color: 'Dorado', peso: '28 kg', sexo: 'Macho', esterilizado: true, vacunas_al_dia: true, foto: null, dueno: { id: 'usr-1', nombre: 'Alejandro Morales', unidad: 'A-101' }, created_at: '2025-08-20T14:30:00Z' },
  { id: 'masc-3', nombre: 'Mishi', especie: 'Gato', raza: 'Siamés', edad: '3 años', color: 'Crema', peso: '4 kg', sexo: 'Hembra', esterilizado: true, vacunas_al_dia: true, foto: null, dueno: { id: 'usr-4', nombre: 'Carolina Reyes', unidad: 'A-303' }, created_at: '2024-11-10T09:15:00Z' },
  { id: 'masc-4', nombre: 'Rocky', especie: 'Perro', raza: 'Bulldog Francés', edad: '5 años', color: 'Gris', peso: '11 kg', sexo: 'Macho', esterilizado: true, vacunas_al_dia: true, foto: null, dueno: { id: 'usr-5', nombre: 'Roberto Díaz', unidad: 'C-102' }, created_at: '2025-01-05T16:20:00Z' },
  { id: 'masc-5', nombre: 'Coco', especie: 'Gato', raza: 'Persa', edad: '1 año', color: 'Blanco', peso: '3 kg', sexo: 'Macho', esterilizado: false, vacunas_al_dia: true, foto: null, dueno: { id: 'usr-6', nombre: 'Ana Silva', unidad: 'A-402' }, created_at: '2026-02-12T11:00:00Z' },
  { id: 'masc-6', nombre: 'Toby', especie: 'Perro', raza: 'Mestizo', edad: '6 años', color: 'Negro', peso: '18 kg', sexo: 'Macho', esterilizado: true, vacunas_al_dia: true, foto: null, dueno: { id: 'usr-7', nombre: 'Luis Pérez', unidad: 'B-108' }, created_at: '2024-09-22T13:45:00Z' },
];

// =============================================================================
// MÓDULO: EVENTOS VECINALES
// =============================================================================
const MOCK_EVENTOS = [
  { id: 'evt-1', titulo: 'Feria de Intercambio Vecinal', descripcion: 'Trae lo que ya no uses y llévate algo nuevo. Ropa, libros, juguetes y más. Habrá café y té para todos.', fecha: '2026-06-15', hora: '10:00', lugar: 'Patio Central', condominio_id: 'condo-chimchorro', organizador: { id: 'usr-1', nombre: 'Administración' }, asistentes: 24, capacidad: 50, imagen: null, tipo: 'comunidad', created_at: '2026-06-01T10:00:00Z' },
  { id: 'evt-2', titulo: 'Charla: Ahorro Energético en el Hogar', descripcion: 'Charla gratuita dictada por SEC sobre cómo reducir el consumo eléctrico. Se entregarán kits de ampolletas LED.', fecha: '2026-06-20', hora: '19:00', lugar: 'Sala Multiuso', condominio_id: 'condo-chimchorro', organizador: { id: 'usr-3', nombre: 'Comité de Medio Ambiente' }, asistentes: 15, capacidad: 30, imagen: null, tipo: 'educativo', created_at: '2026-06-05T14:00:00Z' },
  { id: 'evt-3', titulo: 'Asamblea Ordinaria de Copropietarios', descripcion: 'Revisión de gastos 2026, elección de comité y aprobación de presupuesto 2027. Quórum mínimo: 60%.', fecha: '2026-06-28', hora: '19:30', lugar: 'Sala Multiuso', condominio_id: 'condo-chimchorro', organizador: { id: 'usr-1', nombre: 'Administración' }, asistentes: 0, capacidad: 48, imagen: null, tipo: 'asamblea', created_at: '2026-06-10T09:00:00Z' },
  { id: 'evt-4', titulo: 'Celebración Fiestas Patrias', descripcion: 'Gran celebración con comida típica, cueca y juegos tradicionales. Cada unidad puede traer un plato para compartir.', fecha: '2026-09-18', hora: '12:00', lugar: 'Patio Central', condominio_id: 'condo-chimchorro', organizador: { id: 'usr-1', nombre: 'Administración' }, asistentes: 8, capacidad: 100, imagen: null, tipo: 'celebracion', created_at: '2026-06-08T11:30:00Z' },
  { id: 'evt-5', titulo: 'Operativo Veterinario Gratuito', descripcion: 'Vacunación, desparasitación y atención veterinaria básica. Traer a tu mascota con correa y bozal si corresponde.', fecha: '2026-06-22', hora: '10:00', lugar: 'Estacionamiento Visitas', condominio_id: 'condo-chimchorro', organizador: { id: 'usr-4', nombre: 'Comité Pet-Friendly' }, asistentes: 32, capacidad: 50, imagen: null, tipo: 'mascotas', created_at: '2026-06-03T08:00:00Z' },
];

// =============================================================================
// MÓDULO: AVISOS DE UTILIDAD PÚBLICA
// =============================================================================
const MOCK_AVISOS = [
  { id: 'avi-1', titulo: 'Corte de agua programado', contenido: 'Se informa a todos los residentes que el jueves 13 de junio entre las 09:00 y 13:00 hrs se realizará un corte de agua programado por mantención de matrices. Favor tomar precauciones y almacenar agua.', tipo: 'urgente', prioridad: 'alta', autor: { id: 'usr-1', nombre: 'Administración' }, fecha_publicacion: '2026-06-11T08:00:00Z', bloque_edificio: 'Todos', fijo: true },
  { id: 'avi-2', titulo: 'Mantención ascensor Torre B', contenido: 'El próximo viernes 14 de junio entre 10:00 y 12:00 hrs se realizará mantención preventiva del ascensor de Torre B. Agradecemos usar las escaleras durante ese período.', tipo: 'mantencion', prioridad: 'media', autor: { id: 'usr-1', nombre: 'Administración' }, fecha_publicacion: '2026-06-10T15:30:00Z', bloque_edificio: 'Bloque B', fijo: false },
  { id: 'avi-3', titulo: 'Nuevo horario de basura', contenido: 'A partir del 1 de julio, la recolección de basura será lunes, miércoles y viernes a las 19:00 hrs. Agradecemos sacar los contenedores solo 30 minutos antes.', tipo: 'informativo', prioridad: 'baja', autor: { id: 'usr-1', nombre: 'Administración' }, fecha_publicacion: '2026-06-08T12:00:00Z', bloque_edificio: 'Todos', fijo: false },
  { id: 'avi-4', titulo: 'Celebración Día del Niño', contenido: 'El sábado 9 de agosto realizaremos una celebración para los más pequeños del condominio. Habrá juegos, animación y colaciones. Inscripciones en conserjería.', tipo: 'evento', prioridad: 'media', autor: { id: 'usr-3', nombre: 'Comité de Familia' }, fecha_publicacion: '2026-06-07T10:00:00Z', bloque_edificio: 'Todos', fijo: false },
  { id: 'avi-5', titulo: 'Reciclaje: nuevo punto verde', contenido: 'Se instaló un nuevo punto verde en el estacionamiento de visitas para reciclaje de vidrio, papel y cartón. Recordemos separar nuestros residuos.', tipo: 'informativo', prioridad: 'baja', autor: { id: 'usr-4', nombre: 'Comité de Medio Ambiente' }, fecha_publicacion: '2026-06-05T14:00:00Z', bloque_edificio: 'Todos', fijo: false },
];

// =============================================================================
// MÓDULO: ÁREAS COMUNES Y RESERVAS
// =============================================================================
const MOCK_AREAS_COMUNES = [
  { id: 'area-1', nombre: 'Quincho', descripcion: 'Quincho con capacidad para 20 personas, incluye parrilla, mesón y baños.', capacidad: 20, costo: 15000, horario: '10:00 - 23:00', imagen: null, reglas: ['No fumar dentro', 'Limpiar después de usar', 'Música hasta las 22:00'] },
  { id: 'area-2', nombre: 'Sala Multiuso', descripcion: 'Sala para eventos, reuniones o cumpleaños. Capacidad para 30 personas.', capacidad: 30, costo: 20000, horario: '08:00 - 23:00', imagen: null, reglas: ['Reservar con 48 hrs de anticipación', 'Prohibido fiestas con sonido fuerte'] },
  { id: 'area-3', nombre: 'Piscina', descripcion: 'Piscina temperada abierta en temporada de verano.', capacidad: 15, costo: 0, horario: '10:00 - 19:00', imagen: null, reglas: ['Ducharse antes de ingresar', 'Niños con supervisión adulta'] },
  { id: 'area-4', nombre: 'Gimnasio', descripcion: 'Gimnasio equipado con máquinas de cardio y pesas.', capacidad: 8, costo: 0, horario: '06:00 - 22:00', imagen: null, reglas: ['Limpiar máquinas después de usar', 'Toalla obligatoria'] },
  { id: 'area-5', nombre: 'Sala de Coworking', descripcion: 'Sala con escritorios, wifi y enchufes para trabajo remoto.', capacidad: 6, costo: 0, horario: '08:00 - 21:00', imagen: null, reglas: ['Silencio en horario laboral', 'Máximo 2 horas en hora peak'] },
];

const MOCK_RESERVAS = [
  { id: 'res-1', area_id: 'area-1', area_nombre: 'Quincho', usuario: 'María González', unidad: 'B-204', fecha: '2026-06-21', hora_inicio: '12:00', hora_fin: '18:00', estado: 'confirmada', costo: 15000, created_at: '2026-06-10T10:00:00Z' },
  { id: 'res-2', area_id: 'area-2', area_nombre: 'Sala Multiuso', usuario: 'Carolina Reyes', unidad: 'A-303', fecha: '2026-06-15', hora_inicio: '10:00', hora_fin: '14:00', estado: 'confirmada', costo: 20000, created_at: '2026-06-05T11:30:00Z' },
  { id: 'res-3', area_id: 'area-4', area_nombre: 'Gimnasio', usuario: 'Alejandro Morales', unidad: 'A-101', fecha: '2026-06-13', hora_inicio: '07:00', hora_fin: '08:00', estado: 'confirmada', costo: 0, created_at: '2026-06-12T18:00:00Z' },
  { id: 'res-4', area_id: 'area-1', area_nombre: 'Quincho', usuario: 'Roberto Díaz', unidad: 'C-102', fecha: '2026-06-19', hora_inicio: '19:00', hora_fin: '23:00', estado: 'pendiente', costo: 15000, created_at: '2026-06-11T15:20:00Z' },
];

// =============================================================================
// MÓDULO: INCIDENCIAS / MANTENIMIENTO
// =============================================================================
const MOCK_INCIDENCIAS = [
  { id: 'inc-1', titulo: 'Fuga de agua en pasillo piso 3', descripcion: 'Hay una fuga de agua en el pasillo del piso 3 de Torre B, cerca del departamento 304. Se está acumulando agua y podría causar daño.', categoria: 'Plomería', ubicacion: 'Bloque B, piso 3', prioridad: 'alta', estado: 'en_progreso', reportado_por: { id: 'usr-4', nombre: 'Carolina Reyes', unidad: 'A-303' }, asignado_a: 'Mantenimiento', fecha_reporte: '2026-06-12T08:30:00Z', fecha_estimada: '2026-06-13T18:00:00Z' },
  { id: 'inc-2', titulo: 'Luz quemada en escalera', descripcion: 'La ampolleta del segundo piso de Torre A está quemada, queda oscuro en la escalera.', categoria: 'Electricidad', ubicacion: 'Bloque A, escalera piso 2', prioridad: 'media', estado: 'resuelto', reportado_por: { id: 'usr-1', nombre: 'Administración' }, asignado_a: 'Conserje', fecha_reporte: '2026-06-08T14:00:00Z', fecha_resolucion: '2026-06-08T17:30:00Z' },
  { id: 'inc-3', titulo: 'Puerta de acceso no cierra bien', descripcion: 'La puerta principal de acceso al condominio está fallando, a veces no cierra completamente. Riesgo de seguridad.', categoria: 'Seguridad', ubicacion: 'Acceso principal', prioridad: 'alta', estado: 'resuelto', reportado_por: { id: 'usr-5', nombre: 'Roberto Díaz', unidad: 'C-102' }, asignado_a: 'Cerrajero', fecha_reporte: '2026-06-05T09:00:00Z', fecha_resolucion: '2026-06-06T11:00:00Z' },
  { id: 'inc-4', titulo: 'Ruido excesivo en departamento 502', descripcion: 'Música muy fuerte en horas no permitidas. Ya van tres noches seguidas.', categoria: 'Convivencia', ubicacion: 'Torre B, depto 502', prioridad: 'media', estado: 'nuevo', reportado_por: { id: 'usr-6', nombre: 'Ana Silva', unidad: 'A-402' }, asignado_a: null, fecha_reporte: '2026-06-11T23:30:00Z' },
  { id: 'inc-5', titulo: 'Jardín sin mantención', descripcion: 'El jardín central está muy descuidado, las plantas necesitan poda y riego.', categoria: 'Areas Verdes', ubicacion: 'Jardín central', prioridad: 'baja', estado: 'en_progreso', reportado_por: { id: 'usr-7', nombre: 'Luis Pérez', unidad: 'B-108' }, asignado_a: 'Jardinería', fecha_reporte: '2026-06-09T10:00:00Z' },
  { id: 'inc-6', titulo: 'Ascensor hace ruido extraño', descripcion: 'El ascensor de Torre B hace un ruido metálico al frenar en el piso 4.', categoria: 'Ascensor', ubicacion: 'Torre B', prioridad: 'alta', estado: 'en_progreso', reportado_por: { id: 'usr-2', nombre: 'María González', unidad: 'B-204' }, asignado_a: 'Empresa Ascensores', fecha_reporte: '2026-06-10T07:00:00Z' },
];

// =============================================================================
// MÓDULO: ASAMBLEAS Y VOTACIONES
// =============================================================================
const MOCK_ASAMBLEAS = [
  { id: 'asam-1', titulo: 'Asamblea Ordinaria Junio 2026', descripcion: 'Revisión y aprobación de gastos comunes del primer semestre. Elección del nuevo comité de administración.', fecha: '2026-06-28', hora: '19:30', lugar: 'Sala Multiuso', estado: 'convocada', quorum_requerido: 60, quorum_actual: 0, total_unidades: 48, tabla: ['Aprobación acta anterior', 'Cuenta del comité', 'Aprobación presupuesto semestral', 'Elección de comité', 'Varios'], created_at: '2026-06-10T10:00:00Z' },
  { id: 'asam-2', titulo: 'Asamblea Extraordinaria - Pintura Fachada', descripcion: 'Decisión sobre proyecto de pintura y reparación de fachada. Cotización de empresa especialista.', fecha: '2026-05-15', hora: '20:00', lugar: 'Sala Multiuso', estado: 'realizada', quorum_requerido: 60, quorum_actual: 75, total_unidades: 48, tabla: ['Presentación de cotizaciones', 'Aprobación de presupuesto', 'Definición de plazos'], created_at: '2026-05-01T10:00:00Z' },
];

const MOCK_VOTACIONES = [
  { id: 'vot-1', asamblea_id: 'asam-2', pregunta: '¿Aprueba el presupuesto de $4.500.000 para pintura de fachada?', opciones: [{ texto: 'A favor', votos: 28 }, { texto: 'En contra', votos: 5 }, { texto: 'Abstención', votos: 3 }], estado: 'cerrada', fecha_cierre: '2026-05-15T21:00:00Z' },
  { id: 'vot-2', asamblea_id: 'asam-1', pregunta: '¿Aprueba el presupuesto semestral propuesto?', opciones: [{ texto: 'A favor', votos: 0 }, { texto: 'En contra', votos: 0 }, { texto: 'Abstención', votos: 0 }], estado: 'abierta', fecha_cierre: '2026-06-28T21:00:00Z' },
];

// =============================================================================
// MÓDULO: DOCUMENTOS
// =============================================================================
const MOCK_DOCUMENTOS = [
  { id: 'doc-1', titulo: 'Reglamento de Copropiedad', tipo: 'reglamento', descripcion: 'Reglamento interno vigente del condominio, actualizado 2025.', tamano: '2.4 MB', fecha_subida: '2025-01-15', subido_por: 'Administración', descargas: 142 },
  { id: 'doc-2', titulo: 'Acta Asamblea Mayo 2026', tipo: 'acta', descripcion: 'Acta de la asamblea ordinaria de mayo con acuerdos y votaciones.', tamano: '450 KB', fecha_subida: '2026-05-20', subido_por: 'Administración', descargas: 67 },
  { id: 'doc-3', titulo: 'Presupuesto 2026', tipo: 'presupuesto', descripcion: 'Presupuesto anual aprobado en asamblea de diciembre 2025.', tamano: '1.1 MB', fecha_subida: '2026-01-10', subido_por: 'Administración', descargas: 89 },
  { id: 'doc-4', titulo: 'Reglamento de Uso de Áreas Comunes', tipo: 'reglamento', descripcion: 'Normas para reservas y uso del quincho, piscina, gimnasio y sala multiuso.', tamano: '780 KB', fecha_subida: '2025-03-20', subido_por: 'Administración', descargas: 56 },
  { id: 'doc-5', titulo: 'Manual del Residente', tipo: 'manual', descripcion: 'Guía práctica para nuevos residentes: convivencia, normas y servicios.', tamano: '3.2 MB', fecha_subida: '2025-06-01', subido_por: 'Administración', descargas: 198 },
  { id: 'doc-6', titulo: 'Acta Asamblea Abril 2026', tipo: 'acta', descripcion: 'Acta de la asamblea ordinaria de abril.', tamano: '420 KB', fecha_subida: '2026-04-25', subido_por: 'Administración', descargas: 38 },
];

// =============================================================================
// MÓDULO: PUBLICACIONES DEL MURO (Comunidad)
// =============================================================================
const MOCK_PUBLICACIONES = [
  { id: 'pub-1', autor: { id: 'usr-admin', nombre: 'Administración', unidad: null }, contenido: 'Estimados vecinos, se informa que el corte de agua será a las 15:00 hrs. Bloques A y B. Finaliza aproximadamente a las 17:00 hrs. Favor tomar precauciones y almacenar agua.', fecha_creacion: '2026-06-11T10:00:00Z', cantidad_comentarios: 5, me_gusta: 12, tipo: 'aviso', imagen: null },
  { id: 'pub-2', autor: { id: 'usr-3', nombre: 'Carolina Reyes', unidad: 'A-303' }, contenido: '¡Hola vecinos! Estoy organizando una feria de intercambio este sábado 15 en el patio central. Trae lo que ya no usas y llévate algo nuevo. Habrá café y té para todos. ¡Todos bienvenidos!', fecha_creacion: '2026-06-10T14:30:00Z', cantidad_comentarios: 11, me_gusta: 31, tipo: 'comunidad', imagen: null },
  { id: 'pub-3', autor: { id: 'usr-5', nombre: 'Roberto Díaz', unidad: 'C-102' }, contenido: 'Busco a alguien que me ayude a cargar unas cajas al auto esta tarde entre 17:00 y 18:00 hrs. A cambio le invito un café y unas galletas. Favor escribir al DM.', fecha_creacion: '2026-06-09T16:00:00Z', cantidad_comentarios: 4, me_gusta: 8, tipo: 'ayuda', imagen: null },
  { id: 'pub-4', autor: { id: 'usr-4', nombre: 'Comité de Medio Ambiente', unidad: null }, contenido: 'Vecinos, instalamos un nuevo punto verde en el estacionamiento de visitas. Separemos vidrio, papel y cartón. ¡Cuidemos nuestro entorno juntos!', fecha_creacion: '2026-06-07T11:00:00Z', cantidad_comentarios: 7, me_gusta: 22, tipo: 'comunidad', imagen: null },
  { id: 'pub-5', autor: { id: 'usr-6', nombre: 'Ana Silva', unidad: 'A-402' }, contenido: 'Se perdió un gato siamés color crema llamado Mishi en el sector del bloque A. Responde a su nombre. Si lo ven, favor联系我 al +56 9 8765 4321. Tiene collar con placa.', fecha_creacion: '2026-06-12T07:30:00Z', cantidad_comentarios: 9, me_gusta: 18, tipo: 'mascotas', imagen: null },
];

// =============================================================================
// MÓDULO: MERCADITO (Economía Circular)
// =============================================================================
const MOCK_PRODUCTOS = [
  { id: 'prod-1', vendedor: { id: 'usr-6', nombre: 'Ana Silva', unidad: 'A-402' }, titulo: 'Vendo Bicicleta Aro 26', descripcion: 'Bicicleta en excelente estado, poco uso. Incluye casco y candado. Cambio por scooter en buen estado.', precio: 85000, imagenes: ['/images/bicicleta.jpg'], fecha_publicacion: '2026-06-10T15:00:00Z', cantidad_comentarios: 2, estado: 'activo', categoria: 'transporte' },
  { id: 'prod-2', vendedor: { id: 'usr-3', nombre: 'Carlos Mendoza', unidad: 'B-205' }, titulo: 'Clases de Yoga', descripcion: 'Clases grupales o individuales. Lunes y miércoles 19:00 hrs en sala multiuso. Primera clase gratis. Matricula $5.000 mensual.', precio: 5000, imagenes: ['/images/yoga.jpg'], fecha_publicacion: '2026-06-09T10:00:00Z', cantidad_comentarios: 1, estado: 'activo', categoria: 'servicios' },
  { id: 'prod-3', vendedor: { id: 'usr-7', nombre: 'Elena Torres', unidad: 'C-108' }, titulo: 'Sillón 2 plazas en buen estado', descripcion: 'Color gris, súper cómodo. Sin detalles. Retiro en depto.', precio: 45000, imagenes: ['/images/sillon.jpg'], fecha_publicacion: '2026-06-08T14:00:00Z', cantidad_comentarios: 3, estado: 'activo', categoria: 'muebles' },
  { id: 'prod-moto', vendedor: { id: 'usr-pedro', nombre: 'Pedro Rojas', unidad: 'B-204' }, titulo: 'Moto Honda XR 150', descripcion: 'Moto en excelente estado, papeles al día. Ideal para la ciudad.', precio: 1250000, imagenes: ['/images/moto.jpg'], fecha_publicacion: '2026-06-12T10:00:00Z', cantidad_comentarios: 1, estado: 'activo', categoria: 'transporte' },
  { id: 'prod-4', vendedor: { id: 'usr-2', nombre: 'María González', unidad: 'B-204' }, titulo: 'Clases de inglés para niños', descripcion: 'Profesora titulada. Niños de 6 a 12 años. Grupos reducidos de máx 4. Sábados 10:00 hrs.', precio: 8000, imagenes: [], fecha_publicacion: '2026-06-06T09:00:00Z', cantidad_comentarios: 5, estado: 'activo', categoria: 'servicios' },
  { id: 'prod-5', vendedor: { id: 'usr-1', nombre: 'Alejandro Morales', unidad: 'A-101' }, titulo: 'Vendo pastel de cumpleaños', descripcion: 'Repostería casera. Sabores: chocolate, vainilla, frutilla. Para 15 personas. Pedidos con 48 hrs.', precio: 18000, imagenes: [], fecha_publicacion: '2026-06-05T12:00:00Z', cantidad_comentarios: 4, estado: 'activo', categoria: 'comida' },
  { id: 'prod-6', vendedor: { id: 'usr-5', nombre: 'Roberto Díaz', unidad: 'C-102' }, titulo: 'Reparación de computadores', descripcion: 'Técnico en computación. Formateo, instalación de programas, limpieza. A domicilio en el condominio.', precio: 15000, imagenes: [], fecha_publicacion: '2026-06-03T16:00:00Z', cantidad_comentarios: 6, estado: 'activo', categoria: 'servicios' },
];

// =============================================================================
// MÓDULO: USUARIOS, UNIDADES, ETC.
// =============================================================================
export const MOCK_UNIDAD_CHIMCHORRO = {
  id: 'uni-chimchorro-1', numero: 'B-204', bloque_edificio: 'Bloque B', tipo: 'Departamento', alicuota: 0.0215, metros_cuadrados: 68,
  condominio_id: 'condo-chimchorro', condominio_nombre: 'Condominio Chinchorro',
  tiene_estacionamiento: true, numero_estacionamiento: 'N° 24', tiene_bodega: true, numero_bodega: 'N° 8', responsable_pago: 'propietario',
  titulares: [
    { id: 'tit-1', tipo: 'propietario', nombre: 'María Elena González Reyes', rut: '12.345.678-5', email: 'maria.gonzalez@email.cl', telefono: '+56912345678' },
    { id: 'tit-2', tipo: 'arrendatario', nombre: 'Pedro Andrés Rojas Muñoz', rut: '14.567.890-2', email: 'pedro.rojas.m@email.cl', telefono: '+56987654321' },
  ],
  vehiculos: [
    { id: 'veh-1', tipo_vehiculo: 'Auto', patente: 'BXRT-45', modelo: 'Toyota Yaris 2022' },
    { id: 'veh-2', tipo_vehiculo: 'Moto', patente: 'JXPT-78', modelo: 'Honda XR 150' },
  ],
  mascotas: [{ id: 'masc-1', nombre: 'Luna', especie: 'Perro', raza: 'Beagle', edad: '4 años' }],
  historial_pagos: [
    { periodo: 'Junio 2026', monto: 38800, estado: 'pagado', fecha_pago: '2026-06-02T09:30:00Z' },
    { periodo: 'Mayo 2026', monto: 38200, estado: 'pagado', fecha_pago: '2026-05-03T16:45:00Z' },
    { periodo: 'Abril 2026', monto: 38500, estado: 'pagado', fecha_pago: '2026-04-01T11:20:00Z' },
  ],
  deudas_pendientes: [
    { periodo: 'Diciembre 2025', monto: 38500, dias_mora: 162, estado: 'moroso' },
    { periodo: 'Noviembre 2025', monto: 38000, dias_mora: 132, estado: 'moroso' },
  ],
};

export const MOCK_UNIDADES = [
  { id: 'uni-101', condominio_id: 'condo-chimchorro', numero: '101', tipo: 'Departamento', torre: 'Bloque A', alicuota: 0.0215, metros_cuadrados: 65, estado: 'ocupada' },
  { id: 'uni-102', condominio_id: 'condo-chimchorro', numero: '102', tipo: 'Departamento', torre: 'Bloque A', alicuota: 0.0215, metros_cuadrados: 65, estado: 'ocupada' },
  { id: 'uni-103', condominio_id: 'condo-chimchorro', numero: '103', tipo: 'Departamento', torre: 'Bloque A', alicuota: 0.0200, metros_cuadrados: 60, estado: 'ocupada' },
  { id: 'uni-201', condominio_id: 'condo-chimchorro', numero: '201', tipo: 'Departamento', torre: 'Bloque B', alicuota: 0.0220, metros_cuadrados: 70, estado: 'ocupada' },
  { id: 'uni-202', condominio_id: 'condo-chimchorro', numero: '202', tipo: 'Departamento', torre: 'Bloque B', alicuota: 0.0210, metros_cuadrados: 68, estado: 'ocupada' },
  { id: 'uni-203', condominio_id: 'condo-chimchorro', numero: '203', tipo: 'Departamento', torre: 'Bloque B', alicuota: 0.0210, metros_cuadrados: 68, estado: 'desocupada' },
];

export const MOCK_USUARIOS = [
  { id: 'usr-1', nombre: 'Alejandro Morales', email: 'ale@example.com', rol: 'admin', firebase_uid: 'mock-uid-1', telefono: '+56912345678' },
  { id: 'usr-2', nombre: 'María González', email: 'maria@example.com', rol: 'residente', firebase_uid: 'mock-uid-2', telefono: '+56987654321' },
  { id: 'usr-3', nombre: 'Juan Pérez', email: 'juan@example.com', rol: 'admin', firebase_uid: 'mock-uid-3', telefono: '+56911223344' },
];

// =============================================================================
// INTERCEPTOR DE RUTAS
// =============================================================================
export const interceptarRuta = async (ruta, metodo, cuerpo) => {
  // Sin delay — carga instantánea para demo/prototipo CORFO.
  let datos = null;
  {

      // --- Core: Condominios ---
      if (ruta === '/condominios' && metodo === 'GET') datos = MOCK_CONDOMINIOS;
      else if (ruta.match(/\/condominios\/([^\/]+)\/dashboard\/financiero/) && metodo === 'GET') datos = MOCK_DASHBOARD['condo-chimchorro'];
      else if (ruta.startsWith('/condominios/') && ruta.endsWith('/unidades') && metodo === 'GET') {
        datos = MOCK_UNIDADES.filter(u => u.condominio_id === ruta.split('/')[2]);
      }
      else if (ruta.startsWith('/condominios/') && metodo === 'GET') datos = MOCK_CONDOMINIOS.find(c => c.id === ruta.split('/')[2]) || null;

      // --- Portal Administrativo: Gastos ---
      else if (ruta.match(/\/condominios\/([^\/]+)\/gastos$/) && metodo === 'GET') datos = MOCK_GASTOS;
      else if (ruta.match(/\/condominios\/([^\/]+)\/gastos\/([^\/]+)$/) && metodo === 'GET') {
        const gastoId = ruta.split('/')[4];
        const gasto = MOCK_GASTOS.find(g => g.id === gastoId);
        datos = gasto ? { ...gasto, egresos_operativos: MOCK_EGRESOS[gastoId] || [], resumen_unidades: { total_unidades: 48, total_cobrado: gasto.total_gastos, total_pagado: 1472000, total_pendiente: 368000 } } : null;
      }
      else if (ruta.match(/\/condominios\/([^\/]+)\/gastos\/([^\/]+)\/egresos/) && metodo === 'GET') {
        datos = MOCK_EGRESOS[ruta.split('/')[4]] || [];
      }
      else if (ruta.match(/\/condominios\/([^\/]+)\/gastos\/([^\/]+)\/cobros/) && metodo === 'GET') {
        datos = MOCK_COBROS[ruta.split('/')[4]] || [];
      }
      else if (ruta.match(/\/condominios\/([^\/]+)\/cobros\/([^\/]+)$/) && metodo === 'GET') {
        datos = Object.values(MOCK_COBROS).flat().find(c => c.id === ruta.split('/')[4]) || null;
      }

      // --- Pasarelas ---
      else if (ruta.match(/\/condominios\/([^\/]+)\/pasarelas/) && metodo === 'GET') datos = [{ id: 'pas-1', pasarela: 'flow', activo: true }];
      else if (ruta.match(/\/condominios\/([^\/]+)\/pasarelas/) && metodo === 'POST') datos = { id: `pas-${Date.now()}`, pasarela: cuerpo?.pasarela || 'flow', activo: true };
      else if (ruta.match(/\/condominios\/([^\/]+)\/cobros\/([^\/]+)\/transacciones/) && metodo === 'POST') {
        datos = { transaccion: { id: `tx-${Date.now()}`, pasarela: 'flow', token_transaccion: `T${Date.now()}`, monto_transaccion: cuerpo?.monto || 0, estado_transaccion: 'iniciada' }, url_pasarela: 'https://www.flow.cl/pay/T1234567890', expires_at: new Date(Date.now() + 86400000).toISOString() };
      }
      else if (ruta.match(/\/condominios\/([^\/]+)\/cobros\/([^\/]+)\/pagos/) && metodo === 'POST') {
        datos = { pago: { id: `pago-${Date.now()}`, monto_pagado: cuerpo?.monto_pagado, fecha_pago: cuerpo?.fecha_pago }, cobro_actualizado: { id: ruta.split('/')[4], estado_pago: 'pagado' } };
      }

      // --- Mascotas ---
      else if (ruta.match(/\/condominios\/([^\/]+)\/mascotas/) && metodo === 'GET') datos = MOCK_MASCOTAS;
      else if (ruta.match(/\/condominios\/([^\/]+)\/mascotas/) && metodo === 'POST') datos = { id: `masc-${Date.now()}`, ...cuerpo, created_at: new Date().toISOString() };
      else if (ruta.match(/\/mascotas\/([^\/]+)$/) && metodo === 'GET') datos = MOCK_MASCOTAS.find(m => m.id === ruta.split('/')[2]) || null;

      // --- Eventos ---
      else if (ruta.match(/\/condominios\/([^\/]+)\/eventos/) && metodo === 'GET') datos = MOCK_EVENTOS;
      else if (ruta.match(/\/condominios\/([^\/]+)\/eventos/) && metodo === 'POST') datos = { id: `evt-${Date.now()}`, ...cuerpo, asistentes: 0, created_at: new Date().toISOString() };
      else if (ruta.match(/\/eventos\/([^\/]+)\/asistir/) && metodo === 'POST') datos = { ok: true, mensaje: 'Asistencia confirmada' };

      // --- Avisos ---
      else if (ruta.match(/\/condominios\/([^\/]+)\/avisos/) && metodo === 'GET') datos = MOCK_AVISOS;
      else if (ruta.match(/\/condominios\/([^\/]+)\/avisos/) && metodo === 'POST') datos = { id: `avi-${Date.now()}`, ...cuerpo, fecha_publicacion: new Date().toISOString() };

      // --- Áreas Comunes y Reservas ---
      else if (ruta.match(/\/condominios\/([^\/]+)\/areas-comunes/) && metodo === 'GET') datos = MOCK_AREAS_COMUNES;
      else if (ruta.match(/\/condominios\/([^\/]+)\/reservas/) && metodo === 'GET') datos = MOCK_RESERVAS;
      else if (ruta.match(/\/condominios\/([^\/]+)\/reservas/) && metodo === 'POST') datos = { id: `res-${Date.now()}`, ...cuerpo, estado: 'pendiente', created_at: new Date().toISOString() };

      // --- Incidencias ---
      else if (ruta.match(/\/condominios\/([^\/]+)\/incidencias/) && metodo === 'GET') datos = MOCK_INCIDENCIAS;
      else if (ruta.match(/\/condominios\/([^\/]+)\/incidencias/) && metodo === 'POST') datos = { id: `inc-${Date.now()}`, ...cuerpo, estado: 'nuevo', fecha_reporte: new Date().toISOString() };
      else if (ruta.match(/\/incidencias\/([^\/]+)\/estado/) && metodo === 'PATCH') datos = { ok: true, estado: cuerpo?.estado };

      // --- Asambleas y Votaciones ---
      else if (ruta.match(/\/condominios\/([^\/]+)\/asambleas/) && metodo === 'GET') datos = MOCK_ASAMBLEAS;
      else if (ruta.match(/\/asambleas\/([^\/]+)$/) && metodo === 'GET') {
        const asambleaId = ruta.split('/')[2];
        const asamblea = MOCK_ASAMBLEAS.find(a => a.id === asambleaId);
        const votaciones = MOCK_VOTACIONES.filter(v => v.asamblea_id === asambleaId);
        datos = asamblea ? { ...asamblea, votaciones } : null;
      }
      else if (ruta.match(/\/asambleas\/([^\/]+)\/votar/) && metodo === 'POST') datos = { ok: true, mensaje: 'Voto registrado' };

      // --- Documentos ---
      else if (ruta.match(/\/condominios\/([^\/]+)\/documentos/) && metodo === 'GET') datos = MOCK_DOCUMENTOS;

      // --- Comunidad: Muro y Mercadito ---
      else if (ruta.match(/\/condominios\/([^\/]+)\/publicaciones/) && metodo === 'GET') datos = MOCK_PUBLICACIONES;
      else if (ruta.match(/\/condominios\/([^\/]+)\/productos/) && metodo === 'GET') datos = MOCK_PRODUCTOS;

      // --- Usuarios ---
      else if (ruta === '/usuarios' && metodo === 'GET') datos = MOCK_USUARIOS;

      // --- Unidades ---
      else if (ruta.match(/\/unidades\/([^\/]+)$/) && metodo === 'GET') {
        const match = ruta.match(/\/unidades\/([^\/]+)/);
        if (match) {
          const unidadId = match[1];
          if (unidadId === 'uni-chimchorro-1' || unidadId.includes('chimchorro') || unidadId === '1') datos = MOCK_UNIDAD_CHIMCHORRO;
          else {
            const unidadBase = MOCK_UNIDADES.find(u => u.id === unidadId);
            datos = unidadBase ? { ...unidadBase, titulares: [], vehiculos: [], mascotas: [], historial_pagos: [], deudas_pendientes: [] } : null;
          }
        }
      }

      // --- Default ---
      else if (['POST', 'PUT', 'PATCH'].includes(metodo)) datos = { id: `mock-${Date.now()}`, ...cuerpo };
      else if (metodo === 'DELETE') datos = { success: true };

    return { datos, ok: true, status: 200 };
  }
};
