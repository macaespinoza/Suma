// =============================================================================
// SUMA — Ficha Administrativa de Unidad
// Página maestra para gestionar datos base, titulares, vehículos y mascotas.
// =============================================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUnidades } from '../../../../../../lib/hooks/useUnidades.js';
import Boton from '../../../../../../componentes/ui/Boton.jsx';
import Input from '../../../../../../componentes/ui/Input.jsx';
import Select from '../../../../../../componentes/ui/Select.jsx';
import Toggle from '../../../../../../componentes/ui/Toggle.jsx';
import { ArrowLeft, PawPrint } from '@phosphor-icons/react';
import styles from './page.module.css';

export default function FichaUnidad() {
  const router = useRouter();
  const { id: condominioId, unidadId } = useParams();

  const {
    cargando,
    error,
    obtenerDetalleCompleto,
    actualizarDatosBase,
    agregarTitular,
    eliminarTitular,
    agregarVehiculo,
    eliminarVehiculo,
    agregarMascota,
    eliminarMascota,
  } = useUnidades();

  const [unidad, setUnidad] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Datos base
  const [tieneEstacionamiento, setTieneEstacionamiento] = useState(false);
  const [numeroEstacionamiento, setNumeroEstacionamiento] = useState('');
  const [tieneBodega, setTieneBodega] = useState(false);
  const [numeroBodega, setNumeroBodega] = useState('');

  // Formularios individuales
  const [formPropietario, setFormPropietario] = useState({ nombre: '', rut: '', email: '', telefono: '' });
  const [formArrendatario, setFormArrendatario] = useState({ nombre: '', rut: '', email: '', telefono: '' });
  const [formVehiculo, setFormVehiculo] = useState({ tipo_vehiculo: '', patente: '' });
  const [formMascota, setFormMascota] = useState({ nombre: '', especie: '', raza: '' });

  const cargarUnidad = useCallback(async () => {
    const datos = await obtenerDetalleCompleto(condominioId, unidadId);
    if (datos) {
      setUnidad(datos);
      setTieneEstacionamiento(datos.tiene_estacionamiento);
      setNumeroEstacionamiento(datos.numero_estacionamiento || '');
      setTieneBodega(datos.tiene_bodega);
      setNumeroBodega(datos.numero_bodega || '');

      const propietario = datos.titulares?.find((t) => t.tipo === 'propietario');
      const arrendatario = datos.titulares?.find((t) => t.tipo === 'arrendatario');
      if (propietario) {
        setFormPropietario({
          nombre: propietario.nombre || '',
          rut: propietario.rut || '',
          email: propietario.email || '',
          telefono: propietario.telefono || '',
        });
      }
      if (arrendatario) {
        setFormArrendatario({
          nombre: arrendatario.nombre || '',
          rut: arrendatario.rut || '',
          email: arrendatario.email || '',
          telefono: arrendatario.telefono || '',
        });
      }
    }
  }, [condominioId, unidadId, obtenerDetalleCompleto]);

  useEffect(() => {
    cargarUnidad();
  }, [cargarUnidad]);

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(null), 3000);
  };

  const handleGuardarDatosBase = async () => {
    setGuardando(true);
    try {
      await actualizarDatosBase(condominioId, unidadId, {
        tiene_estacionamiento: tieneEstacionamiento,
        numero_estacionamiento: tieneEstacionamiento ? numeroEstacionamiento || null : null,
        tiene_bodega: tieneBodega,
        numero_bodega: tieneBodega ? numeroBodega || null : null,
      });
      mostrarMensaje('Datos base actualizados.');
    } catch {
      // manejado en hook
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarTitular = async (tipo) => {
    const form = tipo === 'propietario' ? formPropietario : formArrendatario;
    if (!form.nombre.trim()) return;

    setGuardando(true);
    try {
      await agregarTitular(condominioId, unidadId, {
        tipo,
        nombre: form.nombre.trim(),
        rut: form.rut.trim() || null,
        email: form.email.trim() || null,
        telefono: form.telefono.trim() || null,
      });
      mostrarMensaje(`${tipo === 'propietario' ? 'Propietario' : 'Arrendatario'} guardado.`);
      await cargarUnidad();
    } catch {
      // manejado en hook
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarTitular = async (titular) => {
    if (!confirm(`¿Eliminar a ${titular.nombre} como ${titular.tipo}?`)) return;
    setGuardando(true);
    try {
      await eliminarTitular(condominioId, unidadId, titular.id);
      mostrarMensaje('Titular eliminado.');
      await cargarUnidad();
    } catch {
      // manejado en hook
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarVehiculo = async (e) => {
    e.preventDefault();
    if (!formVehiculo.tipo_vehiculo.trim() || !formVehiculo.patente.trim()) return;

    setGuardando(true);
    try {
      await agregarVehiculo(condominioId, unidadId, {
        tipo_vehiculo: formVehiculo.tipo_vehiculo.trim(),
        patente: formVehiculo.patente.trim().toUpperCase(),
      });
      setFormVehiculo({ tipo_vehiculo: '', patente: '' });
      mostrarMensaje('Vehículo agregado.');
      await cargarUnidad();
    } catch {
      // manejado en hook
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarVehiculo = async (vehiculo) => {
    if (!confirm(`¿Eliminar vehículo ${vehiculo.tipo_vehiculo} patente ${vehiculo.patente}?`)) return;
    setGuardando(true);
    try {
      await eliminarVehiculo(condominioId, unidadId, vehiculo.id);
      mostrarMensaje('Vehículo eliminado.');
      await cargarUnidad();
    } catch {
      // manejado en hook
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarMascota = async (e) => {
    e.preventDefault();
    if (!formMascota.nombre.trim() || !formMascota.especie.trim()) return;

    setGuardando(true);
    try {
      await agregarMascota(condominioId, unidadId, {
        nombre: formMascota.nombre.trim(),
        especie: formMascota.especie.trim(),
        raza: formMascota.raza.trim() || null,
      });
      setFormMascota({ nombre: '', especie: '', raza: '' });
      mostrarMensaje('Mascota agregada.');
      await cargarUnidad();
    } catch {
      // manejado en hook
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarMascota = async (mascota) => {
    if (!confirm(`¿Eliminar a ${mascota.nombre}?`)) return;
    setGuardando(true);
    try {
      await eliminarMascota(condominioId, unidadId, mascota.id);
      mostrarMensaje('Mascota eliminada.');
      await cargarUnidad();
    } catch {
      // manejado en hook
    } finally {
      setGuardando(false);
    }
  };

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
  const propietarioActual = titulares.find((t) => t.tipo === 'propietario');
  const arrendatarioActual = titulares.find((t) => t.tipo === 'arrendatario');

  return (
    <div className={`${styles.pagina} animar-entrada`}>
      {/* Mensaje flotante */}
      {mensaje && <div className={styles.toast}>{mensaje}</div>}

      {/* Cabecera */}
      <div className={styles.cabecera}>
        <Boton variante="fantasma" onClick={() => router.push(`/dashboard/condominios/${condominioId}/unidades`)}>
          <><ArrowLeft size={16} weight="bold" /> Volver a unidades</>
        </Boton>
        <div>
          <h1 className={styles.titulo}>
            Ficha Unidad {unidad.numero}
            {unidad.bloque_edificio && (
              <span className={styles.bloque}> — {unidad.bloque_edificio}</span>
            )}
          </h1>
          <p className={styles.subtitulo}>
            Alícuota: {(unidad.alicuota * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Sección 1: Datos Base */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Datos Base de la Unidad</h2>
        <div className={styles.tarjeta}>
          <div className={styles.togglesFila}>
            <div className={styles.toggleCard}>
              <Toggle
                nombre="estacionamiento"
                etiqueta="Estacionamiento"
                activado={tieneEstacionamiento}
                onChange={(e) => setTieneEstacionamiento(e.target.checked)}
              />
              {tieneEstacionamiento && (
                <Input
                  nombre="numero_estacionamiento"
                  etiqueta="Número de estacionamiento"
                  placeholder="Ej: E-12"
                  valor={numeroEstacionamiento}
                  onChange={(e) => setNumeroEstacionamiento(e.target.value)}
                />
              )}
            </div>
            <div className={styles.toggleCard}>
              <Toggle
                nombre="bodega"
                etiqueta="Bodega"
                activado={tieneBodega}
                variante="exito"
                onChange={(e) => setTieneBodega(e.target.checked)}
              />
              {tieneBodega && (
                <Input
                  nombre="numero_bodega"
                  etiqueta="Número de bodega"
                  placeholder="Ej: B-5"
                  valor={numeroBodega}
                  onChange={(e) => setNumeroBodega(e.target.value)}
                />
              )}
            </div>
          </div>
          <div className={styles.accionesTarjeta}>
            <Boton variante="primario" tamano="sm" onClick={handleGuardarDatosBase} cargando={guardando}>
              Guardar Datos Base
            </Boton>
          </div>
        </div>
      </section>

      {/* Sección 2: Titulares */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Titulares de la Unidad</h2>
        <div className={styles.gridTitulares}>
          {/* Propietario */}
          <div className={styles.tarjeta}>
            <h3 className={styles.tarjetaTitulo}>Propietario</h3>
            {propietarioActual && (
              <div className={styles.titularActual}>
                <span className={styles.titularNombre}>{propietarioActual.nombre}</span>
                <span className={styles.titularInfo}>{propietarioActual.rut || 'Sin RUT'} · {propietarioActual.telefono || 'Sin teléfono'}</span>
              </div>
            )}
            <div className={styles.formularioCompacto}>
              <Input
                nombre="prop_nombre"
                etiqueta="Nombre completo"
                placeholder="Ej: Juan Pérez"
                valor={formPropietario.nombre}
                onChange={(e) => setFormPropietario((p) => ({ ...p, nombre: e.target.value }))}
                requerido
              />
              <div className={styles.fila}>
                <Input
                  nombre="prop_rut"
                  etiqueta="RUT"
                  placeholder="Ej: 12345678-5"
                  valor={formPropietario.rut}
                  onChange={(e) => setFormPropietario((p) => ({ ...p, rut: e.target.value }))}
                />
                <Input
                  nombre="prop_telefono"
                  etiqueta="Teléfono"
                  placeholder="+569..."
                  valor={formPropietario.telefono}
                  onChange={(e) => setFormPropietario((p) => ({ ...p, telefono: e.target.value }))}
                />
              </div>
              <Input
                nombre="prop_email"
                etiqueta="Email"
                tipo="email"
                placeholder="juan@email.com"
                valor={formPropietario.email}
                onChange={(e) => setFormPropietario((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className={styles.accionesTarjeta}>
              <Boton variante="primario" tamano="sm" onClick={() => handleGuardarTitular('propietario')} cargando={guardando}>
                {propietarioActual ? 'Actualizar Propietario' : 'Guardar Propietario'}
              </Boton>
              {propietarioActual && (
                <Boton variante="peligro" tamano="sm" onClick={() => handleEliminarTitular(propietarioActual)}>
                  Eliminar
                </Boton>
              )}
            </div>
          </div>

          {/* Arrendatario */}
          <div className={styles.tarjeta}>
            <h3 className={styles.tarjetaTitulo}>Arrendatario</h3>
            {arrendatarioActual && (
              <div className={styles.titularActual}>
                <span className={styles.titularNombre}>{arrendatarioActual.nombre}</span>
                <span className={styles.titularInfo}>{arrendatarioActual.rut || 'Sin RUT'} · {arrendatarioActual.telefono || 'Sin teléfono'}</span>
              </div>
            )}
            <div className={styles.formularioCompacto}>
              <Input
                nombre="arr_nombre"
                etiqueta="Nombre completo"
                placeholder="Ej: María Gómez"
                valor={formArrendatario.nombre}
                onChange={(e) => setFormArrendatario((p) => ({ ...p, nombre: e.target.value }))}
              />
              <div className={styles.fila}>
                <Input
                  nombre="arr_rut"
                  etiqueta="RUT"
                  placeholder="Ej: 11222333-4"
                  valor={formArrendatario.rut}
                  onChange={(e) => setFormArrendatario((p) => ({ ...p, rut: e.target.value }))}
                />
                <Input
                  nombre="arr_telefono"
                  etiqueta="Teléfono"
                  placeholder="+569..."
                  valor={formArrendatario.telefono}
                  onChange={(e) => setFormArrendatario((p) => ({ ...p, telefono: e.target.value }))}
                />
              </div>
              <Input
                nombre="arr_email"
                etiqueta="Email"
                tipo="email"
                placeholder="maria@email.com"
                valor={formArrendatario.email}
                onChange={(e) => setFormArrendatario((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className={styles.accionesTarjeta}>
              <Boton variante="secundario" tamano="sm" onClick={() => handleGuardarTitular('arrendatario')} cargando={guardando}>
                {arrendatarioActual ? 'Actualizar Arrendatario' : 'Guardar Arrendatario'}
              </Boton>
              {arrendatarioActual && (
                <Boton variante="peligro" tamano="sm" onClick={() => handleEliminarTitular(arrendatarioActual)}>
                  Eliminar
                </Boton>
              )}
            </div>
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
                  <div className={styles.itemInfo}>
                    <span className={styles.itemBadge}>{v.tipo_vehiculo}</span>
                    <span className={styles.itemTexto}>{v.patente}</span>
                  </div>
                  <Boton variante="peligro" tamano="sm" onClick={() => handleEliminarVehiculo(v)}>
                    Eliminar
                  </Boton>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAgregarVehiculo} className={styles.formInline}>
            <Select
              nombre="tipo_vehiculo"
              etiqueta="Tipo"
              placeholder="Seleccionar..."
              valor={formVehiculo.tipo_vehiculo}
              onChange={(e) => setFormVehiculo((p) => ({ ...p, tipo_vehiculo: e.target.value }))}
              opciones={[
                { valor: 'Auto', etiqueta: 'Auto' },
                { valor: 'Moto', etiqueta: 'Moto' },
                { valor: 'Camioneta', etiqueta: 'Camioneta' },
                { valor: 'Bicicleta', etiqueta: 'Bicicleta' },
                { valor: 'Otro', etiqueta: 'Otro' },
              ]}
              requerido
            />
            <Input
              nombre="patente"
              etiqueta="Patente"
              placeholder="ABCD12"
              valor={formVehiculo.patente}
              onChange={(e) => setFormVehiculo((p) => ({ ...p, patente: e.target.value.toUpperCase() }))}
              requerido
            />
            <Boton variante="primario" tamano="sm" tipo="submit" cargando={guardando}>
              Agregar
            </Boton>
          </form>
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
                  <div className={styles.itemInfo}>
                    <span className={styles.itemEmoji}>
                      <PawPrint size={20} weight="fill" />
                    </span>
                    <span className={styles.itemTexto}>{m.nombre}</span>
                    <span className={styles.itemDetalle}>{m.especie}{m.raza ? ` · ${m.raza}` : ''}</span>
                  </div>
                  <Boton variante="peligro" tamano="sm" onClick={() => handleEliminarMascota(m)}>
                    Eliminar
                  </Boton>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAgregarMascota} className={styles.formInline}>
            <Input
              nombre="mascota_nombre"
              etiqueta="Nombre"
              placeholder="Ej: Firulais"
              valor={formMascota.nombre}
              onChange={(e) => setFormMascota((p) => ({ ...p, nombre: e.target.value }))}
              requerido
            />
            <Select
              nombre="especie"
              etiqueta="Especie"
              placeholder="Seleccionar..."
              valor={formMascota.especie}
              onChange={(e) => setFormMascota((p) => ({ ...p, especie: e.target.value }))}
              opciones={[
                { valor: 'Perro', etiqueta: 'Perro' },
                { valor: 'Gato', etiqueta: 'Gato' },
                { valor: 'Ave', etiqueta: 'Ave' },
                { valor: 'Pez', etiqueta: 'Pez' },
                { valor: 'Otro', etiqueta: 'Otro' },
              ]}
              requerido
            />
            <Input
              nombre="raza"
              etiqueta="Raza"
              placeholder="Opcional"
              valor={formMascota.raza}
              onChange={(e) => setFormMascota((p) => ({ ...p, raza: e.target.value }))}
            />
            <Boton variante="primario" tamano="sm" tipo="submit" cargando={guardando}>
              Agregar
            </Boton>
          </form>
        </div>
      </section>
    </div>
  );
}
