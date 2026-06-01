// =============================================================================
// SUMA — Página de Creación de Condominio
// Formulario para registrar un nuevo condominio.
// =============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCondominios } from '../../../../lib/hooks/useCondominios.js';
import TarjetaFormulario from '../../../../componentes/ui/TarjetaFormulario.jsx';
import Input from '../../../../componentes/ui/Input.jsx';
import Boton from '../../../../componentes/ui/Boton.jsx';
import styles from './nuevo.module.css';

/**
 * Página de creación de condominio.
 */
export default function PaginaNuevoCondominio() {
  const router = useRouter();
  const { crear, cargando, error } = useCondominios();

  const [formulario, setFormulario] = useState({
    nombre: '',
    direccion: '',
    rut_comunidad: '',
    cantidad_unidades: '',
  });

  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir.
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio.';
    }

    if (!formulario.direccion.trim()) {
      nuevosErrores.direccion = 'La dirección es obligatoria.';
    }

    if (formulario.rut_comunidad.trim() && !/^[0-9]{7,8}-[0-9Kk]$/.test(formulario.rut_comunidad)) {
      nuevosErrores.rut_comunidad = 'Formato inválido. Ejemplo: 76123456-0';
    }

    if (!formulario.cantidad_unidades) {
      nuevosErrores.cantidad_unidades = 'La cantidad de unidades es obligatoria.';
    } else if (parseInt(formulario.cantidad_unidades, 10) < 0) {
      nuevosErrores.cantidad_unidades = 'No puede ser negativa.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    try {
      const nuevoCondominio = await crear({
        ...formulario,
        cantidad_unidades: parseInt(formulario.cantidad_unidades, 10),
      });
      router.push(`/dashboard/condominios/${nuevoCondominio.id}/unidades/inicializar`);
    } catch {
      // El error ya se maneja en el hook.
    }
  };

  return (
    <div className={styles.pagina}>
      <TarjetaFormulario
        titulo="Nuevo Condominio"
        subtitulo="Registra un nuevo condominio en el sistema."
        acciones={
          <>
            <Boton
              variante="fantasma"
              onClick={() => router.push('/dashboard/condominios')}
            >
              Cancelar
            </Boton>
            <Boton
              variante="primario"
              tipo="submit"
              form="form-condominio"
              cargando={cargando}
            >
              Crear Condominio
            </Boton>
          </>
        }
      >
        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <form id="form-condominio" onSubmit={handleSubmit} className={styles.formulario}>
          <Input
            nombre="nombre"
            etiqueta="Nombre del Condominio"
            placeholder="Ej: Condominio Alto Arica"
            valor={formulario.nombre}
            onChange={handleChange}
            error={errores.nombre}
            requerido
          />

          <Input
            nombre="direccion"
            etiqueta="Dirección"
            placeholder="Ej: Av. Santa María 1234, Arica"
            valor={formulario.direccion}
            onChange={handleChange}
            error={errores.direccion}
            requerido
          />

          <div className={styles.fila}>
            <Input
              nombre="rut_comunidad"
              etiqueta="RUT de la Comunidad"
              placeholder="Ej: 76123456-0"
              valor={formulario.rut_comunidad}
              onChange={handleChange}
              error={errores.rut_comunidad}
              ayuda="Opcional. RUT sin puntos, con guión y dígito verificador."
            />

            <Input
              nombre="cantidad_unidades"
              etiqueta="Cantidad de Unidades"
              tipo="number"
              placeholder="Ej: 24"
              valor={formulario.cantidad_unidades}
              onChange={handleChange}
              error={errores.cantidad_unidades}
              requerido
            />
          </div>
        </form>
      </TarjetaFormulario>
    </div>
  );
}
