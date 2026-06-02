// =============================================================================
// SUMA — Página de Detalle de Unidad (Standalone)
// Muestra la ficha completa de una unidad desde la ruta global /dashboard/unidades/[id].
// =============================================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUnidades } from '../../../../lib/hooks/useUnidades.js';
import Boton from '../../../../componentes/ui/Boton.jsx';
import Input from '../../../../componentes/ui/Input.jsx';
import styles from './page.module.css';

export default function PaginaDetalleUnidad() {
  const router = useRouter();
  const { id: unidadId } = useParams();
  
  const { 
    cargando, 
    error, 
    obtenerDetalleStandalone,
    actualizar,
    agregarTitular 
  } = useUnidades();
  
  const [unidad, setUnidad] = useState(null);
  
  // Estados para Responsable del Pago
  const [responsableSeleccionado, setResponsableSeleccionado] = useState('propietario');
  const [terceroForm, setTerceroForm] = useState({ nombre: '', rut: '', email: '', telefono: '' });
  const [mensajeLocal, setMensajeLocal] = useState(null);
  const [guardandoResponsable, setGuardandoResponsable] = useState(false);

  const cargar = useCallback(async () => {
    const datos = await obtenerDetalleStandalone(unidadId);
    if (datos) {
      setUnidad(datos);
      setResponsableSeleccionado(datos.responsable_pago || 'propietario');
      const tercero = datos.titulares?.find((t) => t.tipo === 'tercero');
      if (tercero) {
        setTerceroForm({
          nombre: tercero.nombre || '',
          rut: tercero.rut || '',
          email: tercero.email || '',
          telefono: tercero.telefono || '',
        });
      } else {
        setTerceroForm({ nombre: '', rut: '', email: '', telefono: '' });
      }
    }
  }, [unidadId, obtenerDetalleStandalone]);

  const handleGuardarResponsable = async () => {
    setGuardandoResponsable(true);
    setMensajeLocal(null);
    try {
      // 1. Si se seleccionó Tercero, primero debemos upsertar/crear el titular de tipo 'tercero'
      if (responsableSeleccionado === 'tercero') {
        if (!terceroForm.nombre.trim()) {
          setMensajeLocal({ tipo: 'error', texto: 'El nombre del tercero es obligatorio.' });
          setGuardandoResponsable(false);
          return;
        }
        
        await agregarTitular(unidad.condominio_id, unidad.id, {
          tipo: 'tercero',
          nombre: terceroForm.nombre.trim(),
          rut: terceroForm.rut.trim() || null,
          email: terceroForm.email.trim() || null,
          telefono: terceroForm.telefono.trim() || null,
        });
      }
      
      // 2. Si se seleccionó Arrendatario pero no está registrado en los titulares, avisar
      if (responsableSeleccionado === 'arrendatario') {
        const tieneArrendatario = unidad.titulares?.some((t) => t.tipo === 'arrendatario');
        if (!tieneArrendatario) {
          setMensajeLocal({ tipo: 'error', texto: 'No se puede designar al arrendatario porque no hay un arrendatario registrado.' });
          setGuardandoResponsable(false);
          return;
        }
      }

      // 3. Actualizar la unidad con el nuevo responsable de pago
      await actualizar(unidad.id, {
        responsable_pago: responsableSeleccionado,
      });

      setMensajeLocal({ tipo: 'exito', texto: 'Responsable del pago actualizado con éxito.' });
      await cargar(); // Recargar datos de la unidad
    } catch (err) {
      setMensajeLocal({ tipo: 'error', texto: err.message || 'Error al actualizar el responsable del pago.' });
    } finally {
      setGuardandoResponsable(false);
    }
  };

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
  const tercero = titulares.find((t) => t.tipo === 'tercero');

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

      {/* Sección 2: Responsable del Pago */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Responsable del Pago</h2>
        <div className={styles.tarjeta}>
          <p className={styles.descripcionSeccion}>
            Selecciona el titular o tercero encargado de recibir los cobros de gastos comunes.
          </p>

          {mensajeLocal && (
            <div className={mensajeLocal.tipo === 'exito' ? styles.exitoMsg : styles.errorMsg}>
              {mensajeLocal.texto}
            </div>
          )}

          <div className={styles.selectorResponsable}>
            <label className={`${styles.opcionResponsable} ${responsableSeleccionado === 'propietario' ? styles.opcionActiva : ''}`}>
              <input
                type="radio"
                name="responsable_pago"
                value="propietario"
                checked={responsableSeleccionado === 'propietario'}
                onChange={() => {
                  setResponsableSeleccionado('propietario');
                  setMensajeLocal(null);
                }}
                className={styles.radioOculto}
              />
              <span className={styles.radioLabel}>Propietario</span>
              {propietario ? (
                <span className={styles.radioSubLabel}>{propietario.nombre}</span>
              ) : (
                <span className={styles.radioSubLabelError}>Sin registrar</span>
              )}
            </label>

            <label className={`${styles.opcionResponsable} ${responsableSeleccionado === 'arrendatario' ? styles.opcionActiva : ''} ${!arrendatario ? styles.opcionDeshabilitada : ''}`}>
              <input
                type="radio"
                name="responsable_pago"
                value="arrendatario"
                checked={responsableSeleccionado === 'arrendatario'}
                disabled={!arrendatario}
                onChange={() => {
                  setResponsableSeleccionado('arrendatario');
                  setMensajeLocal(null);
                }}
                className={styles.radioOculto}
              />
              <span className={styles.radioLabel}>Arrendatario</span>
              {arrendatario ? (
                <span className={styles.radioSubLabel}>{arrendatario.nombre}</span>
              ) : (
                <span className={styles.radioSubLabelInfo}>No registrado en titulares</span>
              )}
            </label>

            <label className={`${styles.opcionResponsable} ${responsableSeleccionado === 'tercero' ? styles.opcionActiva : ''}`}>
              <input
                type="radio"
                name="responsable_pago"
                value="tercero"
                checked={responsableSeleccionado === 'tercero'}
                onChange={() => {
                  setResponsableSeleccionado('tercero');
                  setMensajeLocal(null);
                }}
                className={styles.radioOculto}
              />
              <span className={styles.radioLabel}>Tercero</span>
              {terceroForm.nombre ? (
                <span className={styles.radioSubLabel}>{terceroForm.nombre}</span>
              ) : (
                <span className={styles.radioSubLabelInfo}>Asignar datos...</span>
              )}
            </label>
          </div>

          {/* Formulario Tercero */}
          {responsableSeleccionado === 'tercero' && (
            <div className={styles.formTercero}>
              <h3 className={styles.formTerceroTitulo}>Datos del Tercero</h3>
              <div className={styles.gridForm}>
                <Input
                  nombre="tercero_nombre"
                  etiqueta="Nombre completo"
                  placeholder="Ej: Juan Pérez (Familiar)"
                  valor={terceroForm.nombre}
                  onChange={(e) => setTerceroForm({ ...terceroForm, nombre: e.target.value })}
                  requerido
                />
                <Input
                  nombre="tercero_rut"
                  etiqueta="RUT"
                  placeholder="Ej: 12345678-9"
                  valor={terceroForm.rut}
                  onChange={(e) => setTerceroForm({ ...terceroForm, rut: e.target.value })}
                />
                <Input
                  nombre="tercero_email"
                  etiqueta="Email"
                  tipo="email"
                  placeholder="juan.perez@email.com"
                  valor={terceroForm.email}
                  onChange={(e) => setTerceroForm({ ...terceroForm, email: e.target.value })}
                />
                <Input
                  nombre="tercero_telefono"
                  etiqueta="Teléfono"
                  placeholder="Ej: +56912345678"
                  valor={terceroForm.telefono}
                  onChange={(e) => setTerceroForm({ ...terceroForm, telefono: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className={styles.accionesResponsable}>
            <Boton
              variante="primario"
              onClick={handleGuardarResponsable}
              cargando={guardandoResponsable}
            >
              Guardar Responsable del Pago
            </Boton>
          </div>
        </div>
      </section>

      {/* Sección 3: Titulares */}
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

          {/* Tercero */}
          {tercero && (
            <div className={styles.tarjeta}>
              <h3 className={styles.tarjetaTitulo}>Tercero</h3>
              <div className={styles.tarjetaContenido}>
                <p className={styles.nombreTitular}>{tercero.nombre}</p>
                <div className={styles.detallesLista}>
                  {tercero.rut && <span className={styles.detalle}><strong>RUT:</strong> {tercero.rut}</span>}
                  {tercero.email && <span className={styles.detalle}><strong>Email:</strong> {tercero.email}</span>}
                  {tercero.telefono && <span className={styles.detalle}><strong>Tel:</strong> {tercero.telefono}</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sección 4: Vehículos */}
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

      {/* Sección 5: Mascotas */}
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

