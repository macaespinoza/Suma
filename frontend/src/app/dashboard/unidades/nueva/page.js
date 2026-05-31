// =============================================================================
// SUMA — Página de Creación de Unidad Vecinal
// Formulario para registrar una nueva unidad dentro de un condominio.
// =============================================================================

'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../../../lib/api.js';
import { useUnidades } from '../../../../lib/hooks/useUnidades.js';
import TarjetaFormulario from '../../../../componentes/ui/TarjetaFormulario.jsx';
import Input from '../../../../componentes/ui/Input.jsx';
import Select from '../../../../componentes/ui/Select.jsx';
import Boton from '../../../../componentes/ui/Boton.jsx';
import styles from './nueva.module.css';

/**
 * Página de creación de unidad vecinal.
 */
export default function PaginaNuevaUnidad() {
  return (
    <Suspense fallback={<div className={styles.pagina}><p>Cargando...</p></div>}>
      <ContenidoNuevaUnidad />
    </Suspense>
  );
}

function ContenidoNuevaUnidad() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const condominioIdParam = searchParams.get('condominio_id') || '';

  const { crear, cargando, error } = useUnidades();
  const [condominios, setCondominios] = useState([]);

  const [formulario, setFormulario] = useState({
    condominio_id: condominioIdParam,
    bloque_edificio: '',
    numero: '',
    alicuota: '',
  });

  const [errores, setErrores] = useState({});

  const cargarCondominios = useCallback(async () => {
    try {
      const respuesta = await api.get('/condominios');
      setCondominios(respuesta.datos);
    } catch {
      // Silenciar.
    }
  }, []);

  useEffect(() => {
    cargarCondominios();
  }, [cargarCondominios]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!formulario.condominio_id) {
      nuevosErrores.condominio_id = 'Debes seleccionar un condominio.';
    }

    if (!formulario.numero.trim()) {
      nuevosErrores.numero = 'El número es obligatorio.';
    }

    if (!formulario.alicuota) {
      nuevosErrores.alicuota = 'La alícuota es obligatoria.';
    } else {
      const val = parseFloat(formulario.alicuota);
      if (isNaN(val) || val < 0 || val > 1) {
        nuevosErrores.alicuota = 'Debe ser un valor entre 0 y 1 (ej: 0.0417 = 4.17%).';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    try {
      await crear({
        ...formulario,
        alicuota: parseFloat(formulario.alicuota),
        bloque_edificio: formulario.bloque_edificio || null,
      });
      router.push('/dashboard/unidades');
    } catch {
      // El error ya se maneja en el hook.
    }
  };

  const opcionesCondominio = condominios.map((c) => ({
    valor: c.id,
    etiqueta: c.nombre,
  }));

  return (
    <div className={styles.pagina}>
      <TarjetaFormulario
        titulo="Nueva Unidad Vecinal"
        subtitulo="Registra una nueva unidad dentro de un condominio."
        acciones={
          <>
            <Boton
              variante="fantasma"
              onClick={() => router.push('/dashboard/unidades')}
            >
              Cancelar
            </Boton>
            <Boton
              variante="primario"
              tipo="submit"
              form="form-unidad"
              cargando={cargando}
            >
              Crear Unidad
            </Boton>
          </>
        }
      >
        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <form id="form-unidad" onSubmit={handleSubmit} className={styles.formulario}>
          <Select
            nombre="condominio_id"
            etiqueta="Condominio"
            valor={formulario.condominio_id}
            onChange={handleChange}
            opciones={opcionesCondominio}
            placeholder="Seleccionar condominio..."
            error={errores.condominio_id}
            requerido
          />

          <div className={styles.fila}>
            <Input
              nombre="bloque_edificio"
              etiqueta="Bloque / Torre"
              placeholder="Ej: Torre A (opcional)"
              valor={formulario.bloque_edificio}
              onChange={handleChange}
              error={errores.bloque_edificio}
              ayuda="Opcional. Útil para condominios con torres o bloques."
            />

            <Input
              nombre="numero"
              etiqueta="Número de Unidad"
              placeholder="Ej: 101"
              valor={formulario.numero}
              onChange={handleChange}
              error={errores.numero}
              requerido
            />
          </div>

          <Input
            nombre="alicuota"
            etiqueta="Alícuota"
            tipo="number"
            placeholder="Ej: 0.0417 (equivale a 4.17%)"
            valor={formulario.alicuota}
            onChange={handleChange}
            error={errores.alicuota}
            ayuda="Porcentaje de participación como decimal. Ej: 0.0417 = 4.17%."
            requerido
          />
        </form>
      </TarjetaFormulario>
    </div>
  );
}
