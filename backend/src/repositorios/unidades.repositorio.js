// =============================================================================
// SUMA — Repositorio de Unidades Vecinales
// Capa de acceso a datos: consultas SQL preparadas contra PostgreSQL.
// =============================================================================

import { consultar, obtenerCliente } from '../config/database.js';

/**
 * Lista las unidades vecinales de un condominio.
 * @param {string} condominioId - UUID del condominio.
 * @returns {Promise<Array>} Lista de unidades activas.
 */
export const listarPorCondominio = async (condominioId) => {
  const { rows } = await consultar(
    `SELECT uv.id, uv.condominio_id, uv.bloque_edificio, uv.numero, uv.alicuota,
            uv.tiene_estacionamiento, uv.numero_estacionamiento,
            uv.tiene_bodega, uv.numero_bodega,
            uv.activo, uv.created_at, uv.updated_at,
            c.nombre AS condominio_nombre
     FROM Unidades_Vecinales uv
     JOIN Condominios c ON c.id = uv.condominio_id
     WHERE uv.condominio_id = $1 AND uv.activo = TRUE
     ORDER BY uv.bloque_edificio ASC, uv.numero ASC`,
    [condominioId]
  );
  return rows;
};

/**
 * Obtiene una unidad vecinal por su ID.
 * @param {string} id - UUID de la unidad.
 * @returns {Promise<object|null>} Unidad encontrada o null.
 */
export const obtenerPorId = async (id) => {
  const { rows } = await consultar(
    `SELECT uv.id, uv.condominio_id, uv.bloque_edificio, uv.numero, uv.alicuota,
            uv.tiene_estacionamiento, uv.numero_estacionamiento,
            uv.tiene_bodega, uv.numero_bodega,
            uv.activo, uv.created_at, uv.updated_at,
            c.nombre AS condominio_nombre
     FROM Unidades_Vecinales uv
     JOIN Condominios c ON c.id = uv.condominio_id
     WHERE uv.id = $1`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Crea una nueva unidad vecinal.
 * @param {object} datos - Datos de la unidad.
 * @param {string} datos.condominio_id
 * @param {string} datos.bloque_edificio
 * @param {string} datos.numero
 * @param {number} datos.alicuota
 * @returns {Promise<object>} Unidad creada.
 */
export const crear = async ({ condominio_id, bloque_edificio, numero, alicuota }) => {
  const { rows } = await consultar(
    `INSERT INTO Unidades_Vecinales (condominio_id, bloque_edificio, numero, alicuota)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [condominio_id, bloque_edificio, numero, alicuota]
  );
  return rows[0];
};

/**
 * Actualiza una unidad vecinal existente.
 * @param {string} id - UUID de la unidad.
 * @param {object} datos - Campos a actualizar.
 * @returns {Promise<object|null>} Unidad actualizada o null.
 */
export const actualizar = async (id, { bloque_edificio, numero, alicuota, tiene_estacionamiento, numero_estacionamiento, tiene_bodega, numero_bodega }) => {
  const { rows } = await consultar(
    `UPDATE Unidades_Vecinales
     SET bloque_edificio = COALESCE($2, bloque_edificio),
         numero = COALESCE($3, numero),
         alicuota = COALESCE($4, alicuota),
         tiene_estacionamiento = COALESCE($5, tiene_estacionamiento),
         numero_estacionamiento = COALESCE($6, numero_estacionamiento),
         tiene_bodega = COALESCE($7, tiene_bodega),
         numero_bodega = COALESCE($8, numero_bodega)
     WHERE id = $1 AND activo = TRUE
     RETURNING *`,
    [id, bloque_edificio, numero, alicuota, tiene_estacionamiento, numero_estacionamiento, tiene_bodega, numero_bodega]
  );
  return rows[0] || null;
};

/**
 * Desactiva una unidad vecinal (eliminación lógica).
 * @param {string} id - UUID de la unidad.
 * @returns {Promise<boolean>} true si se desactivó.
 */
export const desactivar = async (id) => {
  const { rowCount } = await consultar(
    `UPDATE Unidades_Vecinales SET activo = FALSE WHERE id = $1 AND activo = TRUE`,
    [id]
  );
  return rowCount > 0;
};

/**
 * Actualiza los datos base de una unidad (estacionamiento, bodega).
 * Usa asignación directa para permitir valores nulos explícitos.
 * @param {string} id - UUID de la unidad.
 * @param {object} datos - { tiene_estacionamiento, numero_estacionamiento, tiene_bodega, numero_bodega }
 * @returns {Promise<object|null>}
 */
export const actualizarDatosBase = async (id, { tiene_estacionamiento, numero_estacionamiento, tiene_bodega, numero_bodega }) => {
  const { rows } = await consultar(
    `UPDATE Unidades_Vecinales
     SET tiene_estacionamiento = $2,
         numero_estacionamiento = $3,
         tiene_bodega = $4,
         numero_bodega = $5
     WHERE id = $1 AND activo = TRUE
     RETURNING *`,
    [id, tiene_estacionamiento, numero_estacionamiento, tiene_bodega, numero_bodega]
  );
  return rows[0] || null;
};

/**
 * Obtiene el detalle completo de una unidad: datos base + titulares + vehículos + mascotas.
 * @param {string} id - UUID de la unidad.
 * @returns {Promise<object|null>}
 */
export const obtenerDetalleCompleto = async (id) => {
  const { rows: unidades } = await consultar(
    `SELECT uv.id, uv.condominio_id, uv.bloque_edificio, uv.numero, uv.alicuota,
            uv.tiene_estacionamiento, uv.numero_estacionamiento,
            uv.tiene_bodega, uv.numero_bodega,
            uv.activo, uv.created_at, uv.updated_at
     FROM Unidades_Vecinales uv
     WHERE uv.id = $1`,
    [id]
  );

  const unidad = unidades[0];
  if (!unidad) return null;

  const { rows: titulares } = await consultar(
    `SELECT id, tipo, nombre, rut, email, telefono
     FROM Titulares_Unidad
     WHERE unidad_id = $1
     ORDER BY tipo ASC`,
    [id]
  );

  const { rows: vehiculos } = await consultar(
    `SELECT id, tipo_vehiculo, patente
     FROM Vehiculos
     WHERE unidad_id = $1
     ORDER BY created_at ASC`,
    [id]
  );

  const { rows: mascotas } = await consultar(
    `SELECT id, nombre, especie, raza, foto_url
     FROM Mascotas
     WHERE unidad_id = $1 AND activo = TRUE
     ORDER BY nombre ASC`,
    [id]
  );

  return {
    ...unidad,
    titulares,
    vehiculos,
    mascotas,
  };
};

/**
 * Obtiene los residentes (usuarios) de una unidad vecinal.
 * @param {string} unidadId - UUID de la unidad.
 * @returns {Promise<Array>} Lista de usuarios vinculados.
 */
export const obtenerResidentes = async (unidadId) => {
  const { rows } = await consultar(
    `SELECT u.id, u.nombre_completo, u.email, u.telefono, u.rol,
            uu.es_residente
     FROM Usuarios_Unidades uu
     JOIN Usuarios u ON u.id = uu.usuario_id
     WHERE uu.unidad_id = $1 AND u.deleted_at IS NULL
     ORDER BY u.nombre_completo ASC`,
    [unidadId]
  );
  return rows;
};

/**
 * Crea múltiples unidades vecinales en lote usando una transacción.
 * @param {string} condominioId - UUID del condominio.
 * @param {Array} unidades - Lista de unidades a crear.
 * @returns {Promise<Array>} Lista de unidades creadas.
 */
export const crearLote = async (condominioId, unidades) => {
  const cliente = await obtenerCliente();
  try {
    await cliente.query('BEGIN');
    const creadas = [];
    for (const unidad of unidades) {
      const { rows } = await cliente.query(
        `INSERT INTO Unidades_Vecinales (condominio_id, bloque_edificio, numero, alicuota)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          condominioId,
          unidad.bloque_edificio ? unidad.bloque_edificio.trim() : null,
          unidad.numero.trim(),
          unidad.alicuota
        ]
      );
      creadas.push(rows[0]);
    }
    await cliente.query('COMMIT');
    return creadas;
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
};
