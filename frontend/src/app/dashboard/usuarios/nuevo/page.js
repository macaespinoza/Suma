// =============================================================================
// SUMA — Página de Registro de Usuario
// Formulario para registrar un nuevo usuario en la plataforma.
// =============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUsuarios } from '../../../lib/hooks/useUsuarios.js';
import TarjetaFormulario from '../../../componentes/ui/TarjetaFormulario.jsx';
import Input from '../../../componentes/ui/Input.jsx';
import Select from '../../../componentes/ui/Select.jsx';
import Boton from '../../../componentes/ui/Boton.jsx';
import styles from './nuevo.module.css';

/**
 * Opciones de rol según el ENUM tipo_rol_usuario.
 */
const opcionesRol = [
  { valor: 'propietario', etiqueta: 'Propietario' },
  { valor: 'arrendatario', etiqueta: 'Arrendatario' },
  { valor: 'admin', etiqueta: 'Administrador' },
  { valor: 'conserje', etiqueta: 'Conserje' },
];

/**
 * Página de registro de usuario.
 */
export default function PaginaNuevoUsuario() {
  const router = useRouter();
  const { crear, cargando, error } = useUsuarios();

  const [formulario, setFormulario] = useState({
    firebase_uid: '',
    rut: '',
    nombre_completo: '',
    email: '',
    telefono: '',
    rol: 'arrendatario',
  });

  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!formulario.firebase_uid.trim()) {
      nuevosErrores.firebase_uid = 'El UID de Firebase es obligatorio.';
    }

    if (!formulario.rut.trim()) {
      nuevosErrores.rut = 'El RUT es obligatorio.';
    } else if (!/^[0-9]{7,8}-[0-9Kk]$/.test(formulario.rut)) {
      nuevosErrores.rut = 'Formato inválido. Ejemplo: 12345678-5';
    }

    if (!formulario.nombre_completo.trim()) {
      nuevosErrores.nombre_completo = 'El nombre completo es obligatorio.';
    }

    if (!formulario.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
      nuevosErrores.email = 'El email no es válido.';
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
        telefono: formulario.telefono || null,
      });
      router.push('/dashboard/usuarios');
    } catch {
      // El error ya se maneja en el hook.
    }
  };

  return (
    <div className={styles.pagina}>
      <TarjetaFormulario
        titulo="Nuevo Usuario"
        subtitulo="Registra un nuevo usuario en la plataforma SUMA."
        acciones={
          <>
            <Boton
              variante="fantasma"
              onClick={() => router.push('/dashboard/usuarios')}
            >
              Cancelar
            </Boton>
            <Boton
              variante="primario"
              tipo="submit"
              form="form-usuario"
              cargando={cargando}
            >
              Registrar Usuario
            </Boton>
          </>
        }
      >
        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <form id="form-usuario" onSubmit={handleSubmit} className={styles.formulario}>
          <Input
            nombre="firebase_uid"
            etiqueta="Firebase UID"
            placeholder="UID de Firebase Authentication"
            valor={formulario.firebase_uid}
            onChange={handleChange}
            error={errores.firebase_uid}
            ayuda="UID proporcionado por Firebase Auth al crear la cuenta."
            requerido
          />

          <div className={styles.fila}>
            <Input
              nombre="rut"
              etiqueta="RUT"
              placeholder="Ej: 12345678-5"
              valor={formulario.rut}
              onChange={handleChange}
              error={errores.rut}
              requerido
            />

            <Input
              nombre="nombre_completo"
              etiqueta="Nombre Completo"
              placeholder="Ej: Juan Pérez González"
              valor={formulario.nombre_completo}
              onChange={handleChange}
              error={errores.nombre_completo}
              requerido
            />
          </div>

          <div className={styles.fila}>
            <Input
              nombre="email"
              etiqueta="Email"
              tipo="email"
              placeholder="Ej: juan.perez@email.cl"
              valor={formulario.email}
              onChange={handleChange}
              error={errores.email}
              requerido
            />

            <Input
              nombre="telefono"
              etiqueta="Teléfono"
              placeholder="Ej: +56912345678 (opcional)"
              valor={formulario.telefono}
              onChange={handleChange}
              error={errores.telefono}
            />
          </div>

          <Select
            nombre="rol"
            etiqueta="Rol"
            valor={formulario.rol}
            onChange={handleChange}
            opciones={opcionesRol}
            error={errores.rol}
          />
        </form>
      </TarjetaFormulario>
    </div>
  );
}
