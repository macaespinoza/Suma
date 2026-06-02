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
    `SELECT uv.id, uv.condominio_id, uv.bloque_edificio, uv.numero, uv.metros_cuadrados, uv.alicuota,
            uv.tiene_estacionamiento, uv.numero_estacionamiento,
            uv.tiene_bodega, uv.numero_bodega,
            uv.activo, uv.created_at, uv.updated_at,
            c.nombre AS condominio_nombre,
            COALESCE(prop.nombre, arr.nombre) AS responsable_nombre,
            COALESCE(prop.rut, arr.rut) AS responsable_rut,
            COALESCE(prop.email, arr.email) AS responsable_email,
            COALESCE(prop.telefono, arr.telefono) AS responsable_telefono,
            COALESCE(prop.tipo, arr.tipo) AS responsable_tipo,
            ultimo_cobro.estado_pago
     FROM Unidades_Vecinales uv
     JOIN Condominios c ON c.id = uv.condominio_id
     LEFT JOIN Titulares_Unidad prop ON prop.unidad_id = uv.id AND prop.tipo = 'propietario'
     LEFT JOIN Titulares_Unidad arr ON arr.unidad_id = uv.id AND arr.tipo = 'arrendatario'
     LEFT JOIN LATERAL (
       SELECT cu.estado_pago
       FROM Cobros_Unidad cu
       JOIN Gastos_Comunes_Mes gcm ON gcm.id = cu.gasto_comun_mes_id
       WHERE cu.unidad_id = uv.id
       ORDER BY gcm.mes_anio DESC
       LIMIT 1
     ) ultimo_cobro ON TRUE
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
    `SELECT uv.id, uv.condominio_id, uv.bloque_edificio, uv.numero, uv.metros_cuadrados, uv.alicuota,
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
export const crear = async ({ condominio_id, bloque_edificio, numero, alicuota, metros_cuadrados }) => {
  const { rows } = await consultar(
    `INSERT INTO Unidades_Vecinales (condominio_id, bloque_edificio, numero, alicuota, metros_cuadrados)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [condominio_id, bloque_edificio, numero, alicuota, metros_cuadrados !== undefined ? metros_cuadrados : null]
  );
  return rows[0];
};

/**
 * Actualiza una unidad vecinal existente.
 * @param {string} id - UUID de la unidad.
 * @param {object} datos - Campos a actualizar.
 * @returns {Promise<object|null>} Unidad actualizada o null.
 */
export const actualizar = async (id, { bloque_edificio, numero, alicuota, metros_cuadrados, tiene_estacionamiento, numero_estacionamiento, tiene_bodega, numero_bodega }) => {
  const { rows } = await consultar(
    `UPDATE Unidades_Vecinales
     SET bloque_edificio = COALESCE($2, bloque_edificio),
         numero = COALESCE($3, numero),
         alicuota = COALESCE($4, alicuota),
         metros_cuadrados = COALESCE($5, metros_cuadrados),
         tiene_estacionamiento = COALESCE($6, tiene_estacionamiento),
         numero_estacionamiento = COALESCE($7, numero_estacionamiento),
         tiene_bodega = COALESCE($8, tiene_bodega),
         numero_bodega = COALESCE($9, numero_bodega)
     WHERE id = $1 AND activo = TRUE
     RETURNING *`,
    [id, bloque_edificio, numero, alicuota, metros_cuadrados, tiene_estacionamiento, numero_estacionamiento, tiene_bodega, numero_bodega]
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
    `SELECT uv.id, uv.condominio_id, uv.bloque_edificio, uv.numero, uv.metros_cuadrados, uv.alicuota,
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
        `INSERT INTO Unidades_Vecinales (condominio_id, bloque_edificio, numero, alicuota, metros_cuadrados)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          condominioId,
          unidad.bloque_edificio ? unidad.bloque_edificio.trim() : null,
          unidad.numero.trim(),
          unidad.alicuota,
          unidad.metros_cuadrados !== undefined ? unidad.metros_cuadrados : null
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

/**
 * Calcula (sin guardar) las alícuotas proporcionales según los m2 de las unidades activas.
 * @param {string} condominioId - UUID del condominio.
 * @returns {Promise<object>} Objeto con total_m2, validaciones y lista de previsualización.
 */
export const calcularAlicuotasPorM2 = async (condominioId) => {
  const { rows } = await consultar(
    `SELECT id, bloque_edificio, numero, alicuota AS alicuota_actual, metros_cuadrados 
     FROM Unidades_Vecinales 
     WHERE condominio_id = $1 AND activo = TRUE 
     ORDER BY bloque_edificio ASC, numero ASC`,
    [condominioId]
  );

  let total_m2 = 0;
  let unidades_sin_m2 = 0;
  const unidadesConM2 = [];

  rows.forEach(u => {
    if (u.metros_cuadrados) {
      total_m2 += parseFloat(u.metros_cuadrados);
      unidadesConM2.push(u);
    } else {
      unidades_sin_m2++;
    }
  });

  let suma_alicuotas = 0;
  const preview = rows.map(u => {
    let nueva_alicuota = null;
    if (u.metros_cuadrados && total_m2 > 0) {
      // Calculamos la alícuota a 4 decimales
      nueva_alicuota = parseFloat((parseFloat(u.metros_cuadrados) / total_m2).toFixed(4));
      suma_alicuotas += nueva_alicuota;
    }

    return {
      id: u.id,
      bloque_edificio: u.bloque_edificio,
      numero: u.numero,
      m2: parseFloat(u.metros_cuadrados || 0),
      alicuota_actual: parseFloat(u.alicuota_actual),
      nueva_alicuota: nueva_alicuota !== null ? nueva_alicuota : parseFloat(u.alicuota_actual)
    };
  });

  // Ajuste por redondeo al último elemento para que sume exactamente 1.0000
  if (unidades_sin_m2 === 0 && unidadesConM2.length > 0 && Math.abs(suma_alicuotas - 1.0) > 0.00001) {
    const diferencia = 1.0 - suma_alicuotas;
    // Buscamos la última unidad con m2 en el preview para hacer el ajuste fino
    for (let i = preview.length - 1; i >= 0; i--) {
      if (preview[i].m2 > 0) {
        preview[i].nueva_alicuota = parseFloat((preview[i].nueva_alicuota + diferencia).toFixed(4));
        suma_alicuotas = 1.0;
        break;
      }
    }
  }

  return {
    total_m2: parseFloat(total_m2.toFixed(2)),
    unidades_sin_m2,
    suma_alicuotas: suma_alicuotas.toFixed(4),
    preview
  };
};

/**
 * Aplica las alícuotas calculadas actualizando la base de datos dentro de una transacción.
 * @param {string} condominioId - UUID del condominio.
 * @param {Array} nuevasAlicuotas - Array de { id, alicuota_nueva }
 * @returns {Promise<boolean>}
 */
export const aplicarAlicuotasCalculadas = async (condominioId, nuevasAlicuotas) => {
  const cliente = await obtenerCliente();
  try {
    await cliente.query('BEGIN');
    
    // Verificamos que la suma total sea exactamente 1 (con una tolerancia minúscula por decimales flotantes)
    const suma = nuevasAlicuotas.reduce((acc, curr) => acc + parseFloat(curr.nueva_alicuota), 0);
    if (Math.abs(suma - 1.0) > 0.0001) {
       throw new Error(`La suma de las nuevas alícuotas no es exactamente 1.0000 (Suma calculada: ${suma})`);
    }

    for (const item of nuevasAlicuotas) {
      await cliente.query(
        `UPDATE Unidades_Vecinales 
         SET alicuota = $2 
         WHERE id = $1 AND condominio_id = $3`,
        [item.id, item.nueva_alicuota, condominioId]
      );
    }
    
    await cliente.query('COMMIT');
    return true;
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
};
