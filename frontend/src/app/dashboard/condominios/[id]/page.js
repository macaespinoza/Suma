// =============================================================================
// SUMA — Página de Detalle/Edición de Condominio
// Muestra detalle y permite editar un condominio existente.
// =============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCondominios } from '../../../../lib/hooks/useCondominios.js';
import TarjetaFormulario from '../../../../componentes/ui/TarjetaFormulario.jsx';
import Input from '../../../../componentes/ui/Input.jsx';
import Boton from '../../../../componentes/ui/Boton.jsx';
import Tabla from '../../../../componentes/ui/Tabla.jsx';
import Modal from '../../../../componentes/ui/Modal.jsx';
import { useUnidades } from '../../../../lib/hooks/useUnidades.js';
import PaginaDashboardFinanciero from './dashboard/page.js';
import api from '../../../../lib/api.js';
import { ChartBar, PencilSimple, ArrowLeft } from '@phosphor-icons/react';
import styles from './[id].module.css';

/**
 * Columnas de la tabla de unidades del condominio.
 */
const columnasUnidades = [
  {
    clave: 'bloque_edificio',
    etiqueta: 'Bloque/Torre',
    render: (valor) => valor || '—',
  },
  { clave: 'numero', etiqueta: 'Número' },
  {
    clave: 'metros_cuadrados',
    etiqueta: 'm²',
    render: (valor) => valor ? `${valor} m²` : '—',
  },
  {
    clave: 'alicuota',
    etiqueta: 'Alícuota',
    render: (valor) => `${(valor * 100).toFixed(2)}%`,
  },
  {
    clave: 'tiene_estacionamiento',
    etiqueta: 'Estac.',
    render: (valor, fila) => (
      <span style={{
        display: 'inline-flex',
        padding: '2px 8px',
        borderRadius: 'var(--radio-full)',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: valor ? 'hsla(142, 71%, 35%, 0.12)' : 'rgba(0,0,0,0.06)',
        color: valor ? 'var(--color-exito)' : 'var(--color-texto-terciario)',
        whiteSpace: 'nowrap',
      }}>
        {valor ? (fila.numero_estacionamiento ? `P ${fila.numero_estacionamiento}` : 'P') : '—'}
      </span>
    ),
  },
  {
    clave: 'tiene_bodega',
    etiqueta: 'Bodega',
    render: (valor, fila) => (
      <span style={{
        display: 'inline-flex',
        padding: '2px 8px',
        borderRadius: 'var(--radio-full)',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: valor ? 'hsla(142, 71%, 35%, 0.12)' : 'rgba(0,0,0,0.06)',
        color: valor ? 'var(--color-exito)' : 'var(--color-texto-terciario)',
        whiteSpace: 'nowrap',
      }}>
        {valor ? (fila.numero_bodega ? `B ${fila.numero_bodega}` : 'B') : '—'}
      </span>
    ),
  },
];

/**
 * Página de detalle y edición de condominio.
 */
export default function PaginaDetalleCondominio() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const { condominio, cargando, error, obtenerPorId, actualizar, listarUnidades } = useCondominios();
  const { actualizar: actualizarUnidad, desactivar: eliminarUnidad } = useUnidades();
  const [formulario, setFormulario] = useState(null);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [unidades, setUnidades] = useState([]);
  const [cargandoUnidades, setCargandoUnidades] = useState(false);
  const [modalEditarUnidad, setModalEditarUnidad] = useState(null);
  const [modalEliminarUnidad, setModalEliminarUnidad] = useState(null);
  const [formularioUnidad, setFormularioUnidad] = useState({});
  const [mostrarFormularioEdicion, setMostrarFormularioEdicion] = useState(false);

  // Alícuotas
  const [modalAlicuotasAbierto, setModalAlicuotasAbierto] = useState(false);
  const [cargandoAlicuotas, setCargandoAlicuotas] = useState(false);
  const [previewAlicuotas, setPreviewAlicuotas] = useState(null);
  const [errorAlicuotas, setErrorAlicuotas] = useState(null);

  useEffect(() => {
    if (id) {
      obtenerPorId(id).then((datos) => {
        if (datos) {
          setFormulario({
            nombre: datos.nombre,
            direccion: datos.direccion,
            rut_comunidad: datos.rut_comunidad,
            cantidad_unidades: String(datos.cantidad_unidades),
            porcentaje_fondo_reserva: datos.porcentaje_fondo_reserva ? String(parseFloat(datos.porcentaje_fondo_reserva) * 100) : '0',
          });
        }
      });
      setCargandoUnidades(true);
      listarUnidades(id)
        .then((datos) => setUnidades(datos || []))
        .finally(() => setCargandoUnidades(false));
    }
  }, [id, obtenerPorId, listarUnidades]);

  const handleUnidadCreada = (nuevaUnidad) => {
    setUnidades((prev) => [...prev, nuevaUnidad]);
  };

  const abrirModalEditarUnidad = (unidad) => {
    setModalEditarUnidad(unidad);
    setFormularioUnidad({
      numero: unidad.numero,
      bloque_edificio: unidad.bloque_edificio || '',
      alicuota: unidad.alicuota,
      metros_cuadrados: unidad.metros_cuadrados || '',
    });
  };

  const handleEditarUnidadSubmit = async (e) => {
    e.preventDefault();
    try {
      const actualizada = await actualizarUnidad(modalEditarUnidad.id, {
        numero: formularioUnidad.numero,
        bloque_edificio: formularioUnidad.bloque_edificio || null,
        alicuota: parseFloat(formularioUnidad.alicuota),
        metros_cuadrados: formularioUnidad.metros_cuadrados ? parseFloat(formularioUnidad.metros_cuadrados) : null,
      });
      if (actualizada) {
        setUnidades((prev) => prev.map((u) => (u.id === actualizada.id ? actualizada : u)));
        setModalEditarUnidad(null);
      }
    } catch {
      // Error manejado en hook
    }
  };

  const handleEliminarUnidad = async () => {
    try {
      await eliminarUnidad(modalEliminarUnidad.id);
      setUnidades((prev) => prev.filter((u) => u.id !== modalEliminarUnidad.id));
      setModalEliminarUnidad(null);
    } catch {
      // Error manejado en hook
    }
  };

  const cantidadTotal = formulario ? parseInt(formulario.cantidad_unidades || 0, 10) : 0;
  const faltantes = Math.max(0, cantidadTotal - unidades.length);
  const alicuotaEquitativa = cantidadTotal > 0 ? 1 / cantidadTotal : 0;

  const handleAbrirModalAlicuotas = async () => {
    setModalAlicuotasAbierto(true);
    setCargandoAlicuotas(true);
    setErrorAlicuotas(null);
    try {
      const res = await api.get(`/condominios/${id}/unidades/preview-alicuotas`);
      setPreviewAlicuotas(res.datos);
    } catch (err) {
      setErrorAlicuotas(err.response?.data?.error || 'Error al calcular alícuotas');
    } finally {
      setCargandoAlicuotas(false);
    }
  };

  const handleAplicarAlicuotas = async () => {
    if (!previewAlicuotas) return;
    setCargandoAlicuotas(true);
    try {
      await api.post(`/condominios/${id}/unidades/aplicar-alicuotas`, {
        nuevasAlicuotas: previewAlicuotas,
      });
      setModalAlicuotasAbierto(false);
      // Recargar unidades
      setCargandoUnidades(true);
      const datosUnidades = await listarUnidades(id);
      setUnidades(datosUnidades || []);
      setCargandoUnidades(false);
    } catch (err) {
      setErrorAlicuotas(err.response?.data?.error || 'Error al aplicar alícuotas');
      setCargandoAlicuotas(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validar = () => {
    const nuevosErrores = {};
    if (!formulario.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.';
    if (!formulario.direccion.trim()) nuevosErrores.direccion = 'La dirección es obligatoria.';
    if (formulario.rut_comunidad && !/^[0-9]{7,8}-[0-9Kk]$/.test(formulario.rut_comunidad)) {
      nuevosErrores.rut_comunidad = 'Formato inválido.';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setGuardando(true);
    try {
      await actualizar(id, {
        nombre: formulario.nombre,
        direccion: formulario.direccion,
        rut_comunidad: formulario.rut_comunidad,
        cantidad_unidades: parseInt(formulario.cantidad_unidades, 10),
        porcentaje_fondo_reserva: parseFloat(formulario.porcentaje_fondo_reserva) / 100,
      });
    } catch {
      // El error ya se maneja en el hook.
    } finally {
      setGuardando(false);
    }
  };

  if (cargando || !formulario) {
    return <div className={styles.cargando}>Cargando condominio...</div>;
  }

  if (error && !formulario) {
    return (
      <div className={styles.pagina}>
        <div className={styles.error}>{error}</div>
        <Boton variante="fantasma" onClick={() => router.push('/dashboard/condominios')}>
          Volver a la lista
        </Boton>
      </div>
    );
  }

  return (
    <div className={styles.pagina}>
      {/* 1. Dashboard Financiero (Resumen principal) */}
      <div className={styles.seccionPrincipal}>
        <PaginaDashboardFinanciero embebido={true} />
      </div>

      {/* 2. Tabla de unidades del condominio */}
      <div className={styles.seccionUnidades} style={{ marginTop: '2rem' }}>
        <div className={styles.seccionCabecera}>
          <h3 className={styles.seccionTitulo}>Unidades Vecinales</h3>
          <div className={styles.seccionAcciones}>
            <Boton
              variante="outline"
              tamano="sm"
              onClick={handleAbrirModalAlicuotas}
            >
              <><ChartBar size={16} weight="bold" /> Recalcular Alícuotas (Ley 21.442)</>
            </Boton>
            <Boton
              variante="primario"
              tamano="sm"
              onClick={() => router.push(`/dashboard/unidades/nueva?condominio_id=${id}`)}
            >
              + Nueva Unidad
            </Boton>
          </div>
        </div>
        <Tabla
          columnas={columnasUnidades}
          datos={unidades}
          cargando={cargandoUnidades}
          vacioTexto="Este condominio no tiene unidades registradas."
          acciones={[
            {
              etiqueta: 'Editar',
              onClick: abrirModalEditarUnidad,
            },
            {
              etiqueta: 'Eliminar',
              variante: 'peligro',
              onClick: setModalEliminarUnidad,
            },
          ]}
        />
      </div>

      {/* Formularios para unidades faltantes */}
      {faltantes > 0 && (
        <div className={styles.listaFormulariosInline}>
          <h4 className={styles.seccionTitulo}>Unidades Pendientes por Registrar ({faltantes})</h4>
          {Array.from({ length: faltantes }).map((_, i) => (
            <FormularioUnidadInline
              key={`pendiente-${unidades.length + i}`}
              condominioId={id}
              indiceSugerido={unidades.length + i + 1}
              alicuotaPorDefecto={alicuotaEquitativa}
              onUnidadCreada={handleUnidadCreada}
            />
          ))}
        </div>
      )}

      {/* 3. Formulario de edición (Al final de la página) */}
      <div className={styles.seccionEdicion} style={{ marginTop: '3rem', paddingBottom: '2rem' }}>
        {!mostrarFormularioEdicion ? (
          <Boton variante="outline" onClick={() => setMostrarFormularioEdicion(true)}>
            <><PencilSimple size={16} weight="bold" /> Editar datos del Condominio</>
          </Boton>
        ) : (
          <TarjetaFormulario
            titulo={`Editar: ${condominio?.nombre}`}
            subtitulo="Modifica los datos generales del condominio."
            acciones={
              <>
                <Boton
                  variante="fantasma"
                  onClick={() => setMostrarFormularioEdicion(false)}
                >
                  Cancelar
                </Boton>
                <Boton
                  variante="primario"
                  tipo="submit"
                  form="form-editar-condominio"
                  cargando={guardando}
                >
                  Guardar Cambios
                </Boton>
              </>
            }
          >
            <form id="form-editar-condominio" onSubmit={handleSubmit} className={styles.formulario}>
              <Input
                nombre="nombre"
                etiqueta="Nombre del Condominio"
                valor={formulario.nombre}
                onChange={handleChange}
                error={errores.nombre}
                requerido
              />

              <Input
                nombre="direccion"
                etiqueta="Dirección"
                valor={formulario.direccion}
                onChange={handleChange}
                error={errores.direccion}
                requerido
              />

              <div className={styles.fila}>
                <Input
                  nombre="rut_comunidad"
                  etiqueta="RUT de la Comunidad"
                  valor={formulario.rut_comunidad}
                  onChange={handleChange}
                  error={errores.rut_comunidad}
                />

                <Input
                  nombre="cantidad_unidades"
                  etiqueta="Cantidad de Unidades"
                  tipo="number"
                  valor={formulario.cantidad_unidades}
                  onChange={handleChange}
                  error={errores.cantidad_unidades}
                />

                <Input
                  nombre="porcentaje_fondo_reserva"
                  etiqueta="Fondo de Reserva (%)"
                  tipo="number"
                  step="0.01"
                  valor={formulario.porcentaje_fondo_reserva}
                  onChange={handleChange}
                  error={errores.porcentaje_fondo_reserva}
                />
              </div>
            </form>
          </TarjetaFormulario>
        )}
      </div>

      {/* Modal Editar Unidad */}
      <Modal
        abierto={!!modalEditarUnidad}
        onCerrar={() => setModalEditarUnidad(null)}
        titulo="Editar Unidad"
        tamano="md"
        acciones={
          <>
            <Boton variante="fantasma" onClick={() => setModalEditarUnidad(null)}>Cancelar</Boton>
            <Boton variante="primario" tipo="submit" form="form-editar-unidad">Guardar</Boton>
          </>
        }
      >
        <form id="form-editar-unidad" onSubmit={handleEditarUnidadSubmit} className={styles.formulario}>
          <Input
            nombre="numero"
            etiqueta="Número"
            valor={formularioUnidad.numero || ''}
            onChange={(e) => setFormularioUnidad({ ...formularioUnidad, numero: e.target.value })}
            requerido
          />
          <Input
            nombre="bloque_edificio"
            etiqueta="Bloque/Torre"
            valor={formularioUnidad.bloque_edificio || ''}
            onChange={(e) => setFormularioUnidad({ ...formularioUnidad, bloque_edificio: e.target.value })}
          />
          <Input
            nombre="metros_cuadrados"
            etiqueta="Metros Cuadrados (m²)"
            tipo="number"
            step="0.01"
            valor={formularioUnidad.metros_cuadrados || ''}
            onChange={(e) => setFormularioUnidad({ ...formularioUnidad, metros_cuadrados: e.target.value })}
          />
          <Input
            nombre="alicuota"
            etiqueta="Alícuota"
            tipo="number"
            step="0.0001"
            valor={formularioUnidad.alicuota || ''}
            onChange={(e) => setFormularioUnidad({ ...formularioUnidad, alicuota: e.target.value })}
            requerido
          />
        </form>
      </Modal>

      {/* Modal Eliminar Unidad */}
      <Modal
        abierto={!!modalEliminarUnidad}
        onCerrar={() => setModalEliminarUnidad(null)}
        titulo="Eliminar Unidad"
        tamano="sm"
        acciones={
          <>
            <Boton variante="fantasma" onClick={() => setModalEliminarUnidad(null)}>Cancelar</Boton>
            <Boton variante="peligro" onClick={handleEliminarUnidad}>Eliminar</Boton>
          </>
        }
      >
        <p>¿Estás seguro que deseas eliminar la unidad <strong>{modalEliminarUnidad?.numero}</strong>?</p>
      </Modal>

      {/* Modal Gestión de Alícuotas */}
      <Modal
        abierto={modalAlicuotasAbierto}
        onCerrar={() => setModalAlicuotasAbierto(false)}
        titulo="Recálculo de Alícuotas (Ley 21.442)"
        tamano="lg"
        acciones={
          <>
            <Boton variante="fantasma" onClick={() => setModalAlicuotasAbierto(false)}>Cancelar</Boton>
            <Boton 
              variante="primario" 
              onClick={handleAplicarAlicuotas} 
              cargando={cargandoAlicuotas}
              disabled={!previewAlicuotas || errorAlicuotas}
            >
              Aplicar y Guardar
            </Boton>
          </>
        }
      >
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: 'var(--color-texto-secundario)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            La Ley 21.442 establece que la alícuota de cada unidad se calcula en proporción a sus metros cuadrados respecto del total de la comunidad. 
            A continuación se muestra una vista previa del cálculo para las unidades con <strong>m² registrados</strong>.
          </p>
          
          {errorAlicuotas && (
            <div className={styles.error} style={{ marginBottom: '1rem' }}>{errorAlicuotas}</div>
          )}

          {cargandoAlicuotas && !previewAlicuotas && (
            <p>Calculando alícuotas...</p>
          )}

          {previewAlicuotas && (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead style={{ background: 'var(--color-fondo)', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--color-borde)' }}>Unidad</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid var(--color-borde)' }}>m²</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid var(--color-borde)' }}>Alícuota Actual</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid var(--color-borde)' }}>Nueva Alícuota</th>
                  </tr>
                </thead>
                <tbody>
                  {previewAlicuotas.map((u, i) => {
                    const esModificada = Math.abs((u.alicuota_actual || 0) - u.nueva_alicuota) > 0.0001;
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--color-borde)' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <strong>{u.numero}</strong> {u.bloque_edificio ? `(${u.bloque_edificio})` : ''}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          {u.metros_cuadrados ? `${u.metros_cuadrados} m²` : <span style={{ color: 'var(--color-alerta)' }}>Falta m²</span>}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--color-texto-terciario)' }}>
                          {u.alicuota_actual ? `${(u.alicuota_actual * 100).toFixed(4)}%` : '—'}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: esModificada ? 600 : 400, color: esModificada ? 'var(--color-exito)' : 'inherit' }}>
                          {(u.nueva_alicuota * 100).toFixed(4)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-fondo)', borderRadius: 'var(--radio-md)', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Total Alícuotas:</span>
                <span style={{ color: previewAlicuotas.reduce((acc, u) => acc + u.nueva_alicuota, 0) > 1.0001 ? 'var(--color-peligro)' : 'inherit' }}>
                  {(previewAlicuotas.reduce((acc, u) => acc + u.nueva_alicuota, 0) * 100).toFixed(4)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

/**
 * Componente interno para renderizar el formulario rápido de una unidad.
 */
function FormularioUnidadInline({ condominioId, indiceSugerido, alicuotaPorDefecto, onUnidadCreada }) {
  const { crear, cargando } = useUnidades();
  const [formulario, setFormulario] = useState({
    numero: String(indiceSugerido),
    bloque_edificio: '',
    alicuota: alicuotaPorDefecto ? alicuotaPorDefecto.toFixed(4) : '',
    metros_cuadrados: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formulario.numero || !formulario.alicuota) return;
    try {
      const nuevaUnidad = await crear({
        condominio_id: condominioId,
        numero: formulario.numero,
        bloque_edificio: formulario.bloque_edificio || null,
        alicuota: parseFloat(formulario.alicuota),
        metros_cuadrados: formulario.metros_cuadrados ? parseFloat(formulario.metros_cuadrados) : null,
      });
      if (nuevaUnidad) {
        onUnidadCreada(nuevaUnidad);
      }
    } catch (err) {
      // El error se maneja en el hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formularioInline}>
      <Input
        nombre="numero"
        placeholder="N° Unidad (Ej: 101)"
        valor={formulario.numero}
        onChange={handleChange}
        requerido
      />
      <Input
        nombre="bloque_edificio"
        placeholder="Bloque/Torre (Opcional)"
        valor={formulario.bloque_edificio}
        onChange={handleChange}
      />
      <Input
        nombre="metros_cuadrados"
        tipo="number"
        step="0.01"
        placeholder="m² (Ej: 60.5)"
        valor={formulario.metros_cuadrados}
        onChange={handleChange}
      />
      <Input
        nombre="alicuota"
        tipo="number"
        step="0.0001"
        placeholder="Alícuota (Ej: 0.0417)"
        valor={formulario.alicuota}
        onChange={handleChange}
        requerido
      />
      <Boton tipo="submit" cargando={cargando}>Aceptar</Boton>
    </form>
  );
}
