// =============================================================================
// SUMA — Página de Detalle de Unidad (Standalone)
// Muestra la ficha completa de una unidad desde la ruta global /dashboard/unidades/[id].
// =============================================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUnidades } from '../../../../lib/hooks/useUnidades.js';
import Boton from '../../../../componentes/ui/Boton.jsx';
import styles from './page.module.css';

export default function PaginaDetalleUnidad() {
  const router = useRouter();
  const { id: unidadId } = useParams();
  const { cargando, error, obtenerDetalleStandalone } = useUnidades();
  const [unidad, setUnidad] = useState(null);

  const cargar = useCallback(async () => {
    const datos = await obtenerDetalleStandalone(unidadId);
    if (datos) setUnidad(datos);
  }, [unidadId, obtenerDetalleStandalone]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (cargando && !unidad) {
    return <div className={styles.cargando}>Cargando ficha de unidad...</div>;
  }

  if (error && !unidad) {
    return (
      <div className={styles.pagina}>
        <div className={styles.error}>{error}</div>
        <Boton variante="fantasma" onClick={() => router.back()}>Volver</Boton>
      </div>
    );
  }

  if (!unidad) return null;

  const titulares = unidad.titulares || [];
  const vehiculos = unidad.vehiculos || [];
  const mascotas = unidad.mascotas || [];
  const propietario = titulares.find((t) => t.tipo === 'propietario');
  const arrendatario = titulares.find((t) => t.tipo === 'arrendatario');

  return (
    <div className={`${styles.pagina} animar-entrada`}>
      {/* Cabecera */}
      <div className={styles.cabecera}>
        <div>
          <Boton variante="fantasma" onClick={() => router.push('/dashboard/unidades')}>
            ← Volver a unidades
          </Boton>
          <h1 className={styles.titulo}>
            Unidad {unidad.numero}
            {unidad.bloque_edificio && (
              <span className={styles.bloque}> — {unidad.bloque_edificio}</span>
            )}
          </h1>
          <p className={styles.subtitulo}>
            Alícuota: {(unidad.alicuota * 100).toFixed(2)}%
          </p>
        </div>
        <Boton
          variante="primario"
          onClick={() => router.push(`/dashboard/condominios/${unidad.condominio_id}/unidades/${unidad.id}`)}
        >
          Editar Ficha Completa
        </Boton>
      </div>

      {/* Sección 1: Datos Base */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Datos Base</h2>
        <div className={styles.mosaico}>
          <div className={`${styles.tarjetaDato} ${unidad.tiene_estacionamiento ? styles.tarjetaActiva : styles.tarjetaInactiva}`}>
            <span className={styles.datoIcono}>🚗</span>
            <div>
              <span className={styles.datoEtiqueta}>Estacionamiento</span>
              <span className={styles.datoValor}>
                {unidad.tiene_estacionamiento
                  ? (unidad.numero_estacionamiento || 'Asignado')
                  : 'No tiene'}
              </span>
            </div>
          </div>
          <div className={`${styles.tarjetaDato} ${unidad.tiene_bodega ? styles.tarjetaActiva : styles.tarjetaInactiva}`}>
            <span className={styles.datoIcono}>📦</span>
            <div>
              <span className={styles.datoEtiqueta}>Bodega</span>
              <span className={styles.datoValor}>
                {unidad.tiene_bodega
                  ? (unidad.numero_bodega || 'Asignada')
                  : 'No tiene'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 2: Titulares */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Titulares</h2>
        <div className={styles.gridTitulares}>
          {/* Propietario */}
          <div className={styles.tarjeta}>
            <h3 className={styles.tarjetaTitulo}>Propietario</h3>
            {propietario ? (
              <div className={styles.tarjetaContenido}>
                <p className={styles.nombreTitular}>{propietario.nombre}</p>
                <div className={styles.detallesLista}>
                  {propietario.rut && <span className={styles.detalle}><strong>RUT:</strong> {propietario.rut}</span>}
                  {propietario.email && <span className={styles.detalle}><strong>Email:</strong> {propietario.email}</span>}
                  {propietario.telefono && <span className={styles.detalle}><strong>Tel:</strong> {propietario.telefono}</span>}
                </div>
              </div>
            ) : (
              <p className={styles.vacio}>Sin propietario registrado.</p>
            )}
          </div>

          {/* Arrendatario */}
          <div className={styles.tarjeta}>
            <h3 className={styles.tarjetaTitulo}>Arrendatario</h3>
            {arrendatario ? (
              <div className={styles.tarjetaContenido}>
                <p className={styles.nombreTitular}>{arrendatario.nombre}</p>
                <div className={styles.detallesLista}>
                  {arrendatario.rut && <span className={styles.detalle}><strong>RUT:</strong> {arrendatario.rut}</span>}
                  {arrendatario.email && <span className={styles.detalle}><strong>Email:</strong> {arrendatario.email}</span>}
                  {arrendatario.telefono && <span className={styles.detalle}><strong>Tel:</strong> {arrendatario.telefono}</span>}
                </div>
              </div>
            ) : (
              <p className={styles.vacio}>Sin arrendatario registrado.</p>
            )}
          </div>
        </div>
      </section>

      {/* Sección 3: Vehículos */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Vehículos ({vehiculos.length})</h2>
        <div className={styles.tarjeta}>
          {vehiculos.length === 0 ? (
            <p className={styles.vacio}>Sin vehículos registrados.</p>
          ) : (
            <ul className={styles.lista}>
              {vehiculos.map((v) => (
                <li key={v.id} className={styles.itemLista}>
                  <span className={styles.itemBadge}>{v.tipo_vehiculo}</span>
                  <span className={styles.itemTexto}>{v.patente}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Sección 4: Mascotas */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Mascotas ({mascotas.length})</h2>
        <div className={styles.tarjeta}>
          {mascotas.length === 0 ? (
            <p className={styles.vacio}>Sin mascotas registradas.</p>
          ) : (
            <ul className={styles.lista}>
              {mascotas.map((m) => (
                <li key={m.id} className={styles.itemLista}>
                  <span className={styles.itemEmoji}>
                    {m.especie?.toLowerCase() === 'perro' ? '🐕' : m.especie?.toLowerCase() === 'gato' ? '🐈' : '🐾'}
                  </span>
                  <span className={styles.itemTexto}>{m.nombre}</span>
                  <span className={styles.itemDetalle}>{m.especie}{m.raza ? ` · ${m.raza}` : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
