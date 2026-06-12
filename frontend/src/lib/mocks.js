// =============================================================================
// SUMA — Mock Data para Prototipo
// Datos estáticos para simular el backend en el entorno de demostración (Corfo).
// =============================================================================

export const MOCK_CONDOMINIOS = [
  {
    id: 'condo-1',
    nombre: 'Condominio Alta Vista',
    direccion: 'Av. Las Palmas 1234, Arica',
    estado: 'activo',
    unidades_totales: 120,
    fondo_reserva: 2500000,
    creado_en: new Date().toISOString(),
  },
  {
    id: 'condo-2',
    nombre: 'Edificio Horizonte',
    direccion: 'Costanera Sur 567, Arica',
    estado: 'activo',
    unidades_totales: 45,
    fondo_reserva: 1200000,
    creado_en: new Date().toISOString(),
  },
];

// Mock data detallado para unidad "Condominio Chimchorro" (B-204)
export const MOCK_UNIDAD_CHIMCHORRO = {
  id: 'uni-chimchorro-1',
  numero: 'B-204',
  bloque_edificio: 'Bloque B',
  tipo: 'Departamento',
  alicuota: 0.0215,
  condominio_id: 'condo-chimchorro',
  condominio_nombre: 'Condominio Chimchorro',
  tiene_estacionamiento: true,
  numero_estacionamiento: 'N° 24',
  tiene_bodega: true,
  numero_bodega: 'N° 8',
  responsable_pago: 'propietario',
  titulares: [
    {
      id: 'tit-1',
      tipo: 'propietario',
      nombre: 'María Elena González Reyes',
      rut: '12.345.678-5',
      email: 'maria.gonzalez@email.cl',
      telefono: '+56912345678',
      fecha_registro: '2024-03-15T10:00:00Z',
    },
    {
      id: 'tit-2',
      tipo: 'arrendatario',
      nombre: 'Pedro Andrés Rojas Muñoz',
      rut: '14.567.890-2',
      email: 'pedro.rojas.m@email.cl',
      telefono: '+56987654321',
      fecha_registro: '2025-01-10T14:30:00Z',
    },
  ],
  vehiculos: [
    { id: 'veh-1', tipo_vehiculo: 'Auto', patente: 'BXRT-45', modelo: 'Toyota Yaris 2022' },
    { id: 'veh-2', tipo_vehiculo: 'Moto', patente: 'JXPT-78', modelo: 'Honda XR 150' },
  ],
  mascotas: [
    { id: 'masc-1', nombre: 'Luna', especie: 'Perro', raza: 'Beagle', edad: '4 años' },
  ],
  historial_pagos: [
    { periodo: 'Junio 2026', monto: 38800, estado: 'pagado', fecha_pago: '2026-06-02T09:30:00Z' },
    { periodo: 'Mayo 2026', monto: 38200, estado: 'pagado', fecha_pago: '2026-05-03T16:45:00Z' },
    { periodo: 'Abril 2026', monto: 38500, estado: 'pagado', fecha_pago: '2026-04-01T11:20:00Z' },
    { periodo: 'Marzo 2026', monto: 38000, estado: 'pagado', fecha_pago: '2026-03-05T08:15:00Z' },
    { periodo: 'Febrero 2026', monto: 37500, estado: 'pagado', fecha_pago: '2026-02-28T17:00:00Z' },
    { periodo: 'Enero 2026', monto: 37000, estado: 'pagado', fecha_pago: '2026-01-30T10:30:00Z' },
  ],
  deudas_pendientes: [
    { periodo: 'Diciembre 2025', monto: 38500, dias_mora: 162, estado: 'moroso' },
    { periodo: 'Noviembre 2025', monto: 38000, dias_mora: 132, estado: 'moroso' },
  ],
};

export const MOCK_UNIDADES = [
  { id: 'uni-1', condominio_id: 'condo-1', numero: '101', tipo: 'Departamento', torre: 'A', residente_id: 'usr-1', estado: 'ocupada' },
  { id: 'uni-2', condominio_id: 'condo-1', numero: '102', tipo: 'Departamento', torre: 'A', residente_id: 'usr-2', estado: 'ocupada' },
  { id: 'uni-3', condominio_id: 'condo-1', numero: '103', tipo: 'Departamento', torre: 'B', residente_id: null, estado: 'desocupada' },
  { id: 'uni-4', condominio_id: 'condo-2', numero: '201', tipo: 'Departamento', torre: 'Única', residente_id: 'usr-3', estado: 'ocupada' },
];

export const MOCK_USUARIOS = [
  { id: 'usr-1', nombre: 'Alejandro Morales', email: 'ale@example.com', rol: 'residente', firebase_uid: 'mock-uid-1', telefono: '+56912345678' },
  { id: 'usr-2', nombre: 'María González', email: 'maria@example.com', rol: 'residente', firebase_uid: 'mock-uid-2', telefono: '+56987654321' },
  { id: 'usr-3', nombre: 'Juan Pérez', email: 'juan@example.com', rol: 'admin', firebase_uid: 'mock-uid-3', telefono: '+56911223344' },
];

export const interceptarRuta = (ruta, metodo, cuerpo) => {
  // Simular retardo de red (300ms) para que se vean los estados de carga y animaciones
  return new Promise((resolve) => {
    setTimeout(() => {
      let datos = null;

      if (ruta === '/condominios' && metodo === 'GET') datos = MOCK_CONDOMINIOS;
      else if (ruta.startsWith('/condominios/') && ruta.endsWith('/unidades') && metodo === 'GET') {
        const id = ruta.split('/')[2];
        datos = MOCK_UNIDADES.filter(u => u.condominio_id === id);
      }
      else if (ruta.startsWith('/condominios/') && metodo === 'GET') {
        const id = ruta.split('/')[2];
        datos = MOCK_CONDOMINIOS.find(c => c.id === id) || null;
      }
      else if (ruta === '/usuarios' && metodo === 'GET') datos = MOCK_USUARIOS;
      else if (ruta.startsWith('/usuarios/') && metodo === 'GET') {
        const id = ruta.split('/')[2];
        datos = MOCK_USUARIOS.find(u => u.id === id) || null;
      }
      // Interceptar detalle de unidad standalone (incluye Chimchorro)
      else if ((ruta.match(/\/unidades\/([^\/]+)\/detalle/) || ruta.match(/\/unidades\/([^\/]+)$/)) && metodo === 'GET') {
        const match = ruta.match(/\/unidades\/([^\/]+)/);
        if (match) {
          const unidadId = match[1];
          // Si es el ID especial de Chimchorro o cualquier ID en desarrollo, devolver datos mock ricos
          if (unidadId === 'uni-chimchorro-1' || unidadId.includes('chimchorro') || unidadId === '1') {
            datos = MOCK_UNIDAD_CHIMCHORRO;
          } else {
            // Para otros IDs, buscar en MOCK_UNIDADES o crear datos genéricos
            const unidadBase = MOCK_UNIDADES.find(u => u.id === unidadId);
            datos = unidadBase ? {
              ...unidadBase,
              titulares: [],
              vehiculos: [],
              mascotas: [],
              historial_pagos: [],
              deudas_pendientes: [],
            } : null;
          }
        }
      }
      // Manejo por defecto (eco del cuerpo para POST/PUT)
      else if (['POST', 'PUT', 'PATCH'].includes(metodo)) {
        datos = { id: `mock-${Date.now()}`, ...cuerpo };
      }
      else if (metodo === 'DELETE') {
        datos = { success: true };
      }

      resolve({ datos, ok: true, status: 200 });
    }, 500);
  });
};