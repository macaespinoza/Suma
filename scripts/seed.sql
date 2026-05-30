-- =============================================================================
-- SUMA — Script de Datos de Prueba (Seed) para Desarrollo Local
-- Autor: Antigravity (Arquitecto Cloud)
-- Motor: PostgreSQL (Cloud SQL)
--
-- NOTA: Este script debe ejecutarse DESPUÉS de init.sql.
-- Los RUTs usados son ficticios pero VÁLIDOS según el algoritmo Módulo 11.
-- =============================================================================

-- =============================================================================
-- 1. CONDOMINIOS DE PRUEBA
-- =============================================================================

INSERT INTO Condominios (id, nombre, direccion, rut_comunidad, cantidad_unidades) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'Condominio Alto Arica',
   'Av. Santa María 1234, Arica',
   '76123456-K',  -- RUT válido Módulo 11
   12),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901',
   'Residencial Los Olivos',
   'Pasaje Los Aromos 567, Arica',
   '76234567-8',  -- RUT válido Módulo 11
   8);


-- =============================================================================
-- 2. UNIDADES VECINALES (distribuidas en bloques/torres)
-- =============================================================================

-- Condominio Alto Arica: 2 torres, 6 departamentos cada una.
INSERT INTO Unidades_Vecinales (id, condominio_id, bloque_edificio, numero, alicuota) VALUES
  -- Torre A
  ('c3d4e5f6-a7b8-9012-cdef-123456789012',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Torre A', '101', 0.0833),
  ('d4e5f6a7-b8c9-0123-defa-234567890123',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Torre A', '102', 0.0833),
  ('e5f6a7b8-c9d0-1234-efab-345678901234',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Torre A', '201', 0.0833),
  ('f6a7b8c9-d0e1-2345-fabc-456789012345',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Torre A', '202', 0.0833),
  -- Torre B
  ('a7b8c9d0-e1f2-3456-abcd-567890123456',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Torre B', '101', 0.0833),
  ('b8c9d0e1-f2a3-4567-bcde-678901234567',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Torre B', '102', 0.0833);

-- Residencial Los Olivos: casas sin bloque.
INSERT INTO Unidades_Vecinales (id, condominio_id, bloque_edificio, numero, alicuota) VALUES
  ('c9d0e1f2-a3b4-5678-cdef-789012345678',
   'b2c3d4e5-f6a7-8901-bcde-f12345678901', NULL, 'Casa 1', 0.2500),
  ('d0e1f2a3-b4c5-6789-defa-890123456789',
   'b2c3d4e5-f6a7-8901-bcde-f12345678901', NULL, 'Casa 2', 0.2500);


-- =============================================================================
-- 3. USUARIOS DE PRUEBA (con diferentes roles)
-- =============================================================================

INSERT INTO Usuarios (id, firebase_uid, rut, nombre_completo, email, telefono, rol) VALUES
  -- Administrador
  ('11111111-1111-1111-1111-111111111111',
   'firebase_uid_admin_001',
   '12345678-5',  -- RUT válido Módulo 11
   'María Fernández López',
   'maria.fernandez@email.cl',
   '+56911111111',
   'admin'),
  -- Propietario
  ('22222222-2222-2222-2222-222222222222',
   'firebase_uid_propietario_001',
   '13456789-0',  -- RUT válido Módulo 11
   'Carlos Muñoz Rojas',
   'carlos.munoz@email.cl',
   '+56922222222',
   'propietario'),
  -- Arrendatario
  ('33333333-3333-3333-3333-333333333333',
   'firebase_uid_arrendatario_001',
   '14567890-4',  -- RUT válido Módulo 11
   'Ana Vargas Pinto',
   'ana.vargas@email.cl',
   '+56933333333',
   'arrendatario'),
  -- Conserje
  ('44444444-4444-4444-4444-444444444444',
   'firebase_uid_conserje_001',
   '15678901-8',  -- RUT válido Módulo 11
   'Pedro Soto Díaz',
   'pedro.soto@email.cl',
   '+56944444444',
   'conserje');


-- =============================================================================
-- 4. RELACIÓN USUARIOS ↔ UNIDADES (Tabla Pivote)
-- =============================================================================

INSERT INTO Usuarios_Unidades (usuario_id, unidad_id, es_residente) VALUES
  -- María (admin) es propietaria de Torre A, Depto 101.
  ('11111111-1111-1111-1111-111111111111',
   'c3d4e5f6-a7b8-9012-cdef-123456789012', TRUE),
  -- Carlos (propietario) es dueño de Torre A, Depto 102, pero no vive ahí.
  ('22222222-2222-2222-2222-222222222222',
   'd4e5f6a7-b8c9-0123-defa-234567890123', FALSE),
  -- Ana (arrendataria) arrienda Torre A, Depto 102 (de Carlos).
  ('33333333-3333-3333-3333-333333333333',
   'd4e5f6a7-b8c9-0123-defa-234567890123', TRUE),
  -- Pedro (conserje) está vinculado a Torre B, Depto 101 (vive ahí).
  ('44444444-4444-4444-4444-444444444444',
   'a7b8c9d0-e1f2-3456-abcd-567890123456', TRUE);


-- =============================================================================
-- 5. GASTOS COMUNES DE PRUEBA
-- =============================================================================

INSERT INTO Gastos_Comunes_Mes (id, condominio_id, mes_anio, total_gastos, estado) VALUES
  ('55555555-5555-5555-5555-555555555555',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   '2026-05-01',
   450000.00,
   'publicado');


-- =============================================================================
-- 6. EGRESOS OPERATIVOS DEL MES
-- =============================================================================

INSERT INTO Egresos_Operativos (gasto_comun_mes_id, categoria, descripcion, monto) VALUES
  ('55555555-5555-5555-5555-555555555555', 'Agua', 'Consumo agua potable mayo 2026', 85000.00),
  ('55555555-5555-5555-5555-555555555555', 'Electricidad', 'Áreas comunes y pasillos', 62000.00),
  ('55555555-5555-5555-5555-555555555555', 'Portería', 'Sueldo conserje mayo 2026', 180000.00),
  ('55555555-5555-5555-5555-555555555555', 'Mantención', 'Reparación bomba de agua', 45000.00),
  ('55555555-5555-5555-5555-555555555555', 'Aseo', 'Servicio limpieza áreas comunes', 78000.00);


-- =============================================================================
-- 7. COBROS POR UNIDAD (prorrateo por alícuota)
-- =============================================================================

INSERT INTO Cobros_Unidad (unidad_id, gasto_comun_mes_id, monto_cobrado, saldo_anterior, total_a_pagar, estado_pago) VALUES
  -- Torre A, 101: 450000 * 0.0833 = 37485
  ('c3d4e5f6-a7b8-9012-cdef-123456789012',
   '55555555-5555-5555-5555-555555555555', 37485.00, 0.00, 37485.00, 'pagado'),
  -- Torre A, 102: con saldo anterior
  ('d4e5f6a7-b8c9-0123-defa-234567890123',
   '55555555-5555-5555-5555-555555555555', 37485.00, 15000.00, 52485.00, 'pendiente'),
  -- Torre B, 101:
  ('a7b8c9d0-e1f2-3456-abcd-567890123456',
   '55555555-5555-5555-5555-555555555555', 37485.00, 0.00, 37485.00, 'moroso');


-- =============================================================================
-- 8. MASCOTAS
-- =============================================================================

INSERT INTO Mascotas (unidad_id, nombre, especie, raza) VALUES
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Luna', 'Perro', 'Golden Retriever'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Michi', 'Gato', 'Siamés'),
  ('a7b8c9d0-e1f2-3456-abcd-567890123456', 'Rocky', 'Perro', 'Bulldog Francés');


-- =============================================================================
-- 9. PUBLICACIONES EN EL MURO SOCIAL
-- =============================================================================

INSERT INTO Publicaciones_Muro (condominio_id, autor_id, tipo, titulo, contenido) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   '11111111-1111-1111-1111-111111111111',
   'aviso_oficial',
   'Corte de agua programado',
   'Estimados vecinos, se informa que el día sábado 7 de junio se realizará un corte de agua desde las 08:00 hasta las 14:00 hrs. por mantención de la bomba principal. Disculpen las molestias.'),

  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   '33333333-3333-3333-3333-333333333333',
   'social',
   '¡Bienvenida a los nuevos vecinos! 🎉',
   'Les damos la bienvenida a la familia Martínez que se mudó al depto 201 de la Torre A. ¡Un gusto tenerlos en nuestra comunidad!'),

  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   '22222222-2222-2222-2222-222222222222',
   'mercadito',
   'Vendo bicicleta aro 26',
   'Bicicleta montañera en excelente estado, poco uso. Ideal para pasear por la costanera de Arica. Precio conversable.');


-- =============================================================================
-- 10. ITEM DEL MERCADITO (extensión de publicación tipo 'mercadito')
-- =============================================================================

-- Obtenemos el ID de la publicación del mercadito para vincularla.
INSERT INTO Mercadito_Items (publicacion_id, precio, estado, categoria)
SELECT id, 85000.00, 'disponible', 'producto'
FROM Publicaciones_Muro
WHERE titulo = 'Vendo bicicleta aro 26'
LIMIT 1;


-- =============================================================================
-- 11. REGISTRO DE VISITAS
-- =============================================================================

INSERT INTO Registro_Visitas (unidad_id, nombre_visita, rut_visita, patente_vehiculo) VALUES
  ('c3d4e5f6-a7b8-9012-cdef-123456789012',
   'Roberto Jiménez', '16789012-3', 'ABCD12'),
  ('d4e5f6a7-b8c9-0123-defa-234567890123',
   'Laura Mendoza', NULL, NULL);  -- Visita sin RUT (extranjera) y sin vehículo.


-- =============================================================================
-- FIN DEL SEED
-- Datos de prueba para desarrollo local — No ejecutar en producción.
-- =============================================================================
