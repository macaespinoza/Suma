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
  const [formulario, setFormulario] = useState(null);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [unidades, setUnidades] = useState([]);
  const [cargandoUnidades, setCargandoUnidades] = useState(false);

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
          <Boton
            variante="outline"
            tamano="sm"
            onClick={() => router.push(`/dashboard/unidades/nueva?condominio_id=${id}`)}
          >
            + Nueva Unidad
          </Boton>
        </div>
        <Tabla
          columnas={columnasUnidades}
          datos={unidades}
          cargando={cargandoUnidades}
          vacioTexto="Este condominio no tiene unidades registradas."
        />
      </div>
    </div>
  );
}
