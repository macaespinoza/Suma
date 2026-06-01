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
    clave: 'alicuota',
    etiqueta: 'Alícuota',
    render: (valor) => `${(valor * 100).toFixed(2)}%`,
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

  useEffect(() => {
    if (id) {
      obtenerPorId(id).then((datos) => {
        if (datos) {
          setFormulario({
            nombre: datos.nombre,
            direccion: datos.direccion,
            rut_comunidad: datos.rut_comunidad,
            cantidad_unidades: String(datos.cantidad_unidades),
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
    });
  };

  const handleEditarUnidadSubmit = async (e) => {
    e.preventDefault();
    try {
      const actualizada = await actualizarUnidad(modalEditarUnidad.id, {
        numero: formularioUnidad.numero,
        bloque_edificio: formularioUnidad.bloque_edificio || null,
        alicuota: parseFloat(formularioUnidad.alicuota),
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
      {/* Formulario de edición */}
      <TarjetaFormulario
        titulo={`Editar: ${condominio?.nombre}`}
        subtitulo="Modifica los datos del condominio."
        acciones={
          <>
            <Boton
              variante="outline"
              onClick={() => router.push(`/dashboard/condominios/${id}/dashboard`)}
            >
              📊 Dashboard Financiero
            </Boton>
            <Boton
              variante="fantasma"
              onClick={() => router.push('/dashboard/condominios')}
            >
              Volver
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
          </div>
        </form>
      </TarjetaFormulario>

      {/* Tabla de unidades del condominio */}
      <div className={styles.seccionUnidades}>
        <div className={styles.seccionCabecera}>
          <h3 className={styles.seccionTitulo}>Unidades Vecinales</h3>
          <div className={styles.seccionAcciones}>
            <Boton
              variante="outline"
              tamano="sm"
              onClick={() => router.push(`/dashboard/condominios/${id}/gastos`)}
            >
              💰 Gastos Comunes
            </Boton>
            <Boton
              variante="outline"
              tamano="sm"
              onClick={() => router.push(`/dashboard/condominios/${id}/dashboard`)}
            >
              📊 Dashboard
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
