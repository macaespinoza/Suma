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
  }
];

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
