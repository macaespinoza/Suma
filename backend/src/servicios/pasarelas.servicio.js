// =============================================================================
// SUMA — Servicio de Pasarelas de Pago
// Lógica de negocio: gestión de credenciales de pasarelas de pago.
// =============================================================================

import * as pasarelasRepo from '../repositorios/pasarelas.repositorio.js';
import * as unidadesRepo from '../repositorios/condominios.repositorio.js';
import { ErrorApp } from '../middlewares/errores.js';

const PASARELAS_VALIDAS = ['flow', 'fintoc', 'mercado_pago'];

export const listarPasarelas = async (condominioId) => {
  const condominio = await unidadesRepo.obtenerPorId(condominioId);
  if (!condominio) {
    throw new ErrorApp('CONDOMINIO_NO_ENCONTRADO', 'El condominio no existe.', 404);
  }

  const pasarelas = await pasarelasRepo.listarPorCondominio(condominioId);

  return pasarelas.map(p => ({
    id: p.id,
    condominio_id: p.condominio_id,
    pasarela: p.pasarela,
    activo: p.activo,
    created_at: p.created_at
  }));
};

export const guardarCredenciales = async (condominioId, { pasarela, api_key, secret_key }) => {
  if (!PASARELAS_VALIDAS.includes(pasarela)) {
    throw new ErrorApp('PASARELA_INVALIDA', `Pasarela inválida. Debe ser una de: ${PASARELAS_VALIDAS.join(', ')}`, 400);
  }

  const condominio = await unidadesRepo.obtenerPorId(condominioId);
  if (!condominio) {
    throw new ErrorApp('CONDOMINIO_NO_ENCONTRADO', 'El condominio no existe.', 404);
  }

  const existente = await pasarelasRepo.obtenerPorCondominioYPasarela(condominioId, pasarela);
  if (existente) {
    throw new ErrorApp('PASARELA_DUPLICADA', 'Ya existe una credencial para esta pasarela en este condominio.', 400);
  }

  const apiKeyEncriptada = encriptar(api_key);
  const secretKeyEncriptada = secret_key ? encriptar(secret_key) : null;

  const credencial = await pasarelasRepo.crear({
    condominioId,
    pasarela,
    apiKey: apiKeyEncriptada,
    secretKey: secretKeyEncriptada
  });

  return {
    id: credencial.id,
    condominio_id: credencial.condominio_id,
    pasarela: credencial.pasarela,
    activo: credencial.activo,
    created_at: credencial.created_at
  };
};

export const cambiarEstado = async (pasarelaId, { activo }) => {
  const credencial = await pasarelasRepo.obtenerPorId(pasarelaId);
  if (!credencial) {
    throw new ErrorApp('PASARELA_NO_ENCONTRADA', 'La pasarela no existe.', 404);
  }

  const actualizada = await pasarelasRepo.actualizarActivo(pasarelaId, activo);

  return {
    id: actualizada.id,
    condominio_id: actualizada.condominio_id,
    pasarela: actualizada.pasarela,
    activo: actualizada.activo,
    created_at: actualizada.created_at
  };
};

function encriptar(texto) {
  const clave = process.env.ENCRYPTION_KEY || 'clave-temporal-para-desarrollo';
  let resultado = '';
  for (let i = 0; i < texto.length; i++) {
    const charCode = texto.charCodeAt(i) ^ clave.charCodeAt(i % clave.length);
    resultado += String.fromCharCode(charCode);
  }
  return Buffer.from(resultado, 'utf-8').toString('base64');
}
