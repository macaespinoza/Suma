// =============================================================================
// SUMA — Página de Inicialización Masiva de Unidades Vecinales
// Permite rellenar todas las unidades en un solo paso con alícuotas automáticas.
// =============================================================================

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCondominios } from '../../../../../../lib/hooks/useCondominios.js';
import { useUnidades } from '../../../../../../lib/hooks/useUnidades.js';
import Boton from '../../../../../../componentes/ui/Boton.jsx';
import Input from '../../../../../../componentes/ui/Input.jsx';
import styles from './inicializar.module.css';

export default function PaginaInicializarUnidades() {
  const router = useRouter();
  const { id: condominioId } = useParams();
  const { obtenerPorId, cargando: cargandoCondominio } = useCondominios();
  const { crearLote, cargando: guardando, error: errorUnidades } = useUnidades();

  const [condominio, setCondominio] = useState(null);
  const [unidadesForm, setUnidadesForm] = useState([]);
  const [errorLocal, setErrorLocal] = useState(null);

  // Estados para la generación rápida
  const [genBloque, setGenBloque] = useState('');
  const [genInicioNumero, setGenInicioNumero] = useState('101');

  // Cargar datos del condominio
  useEffect(() => {
    if (condominioId) {
      obtenerPorId(condominioId)
        .then((datos) => {
          setCondominio(datos);
          // Inicializar los formularios vacíos con la alícuota calculada por defecto.
          const cantidad = datos.cantidad_unidades || 0;
          const alicuotaDefecto = cantidad > 0 ? parseFloat((1 / cantidad).toFixed(4)) : 0;
          
          const iniciales = Array.from({ length: cantidad }, (_, i) => ({
            bloque_edificio: '',
            numero: '',
            alicuota: alicuotaDefecto.toString(),
          }));
          setUnidadesForm(iniciales);
        })
        .catch(() => {
          setErrorLocal('No se pudieron cargar los detalles del condominio.');
        });
    }
  }, [condominioId, obtenerPorId]);

  // Manejar el cambio en un campo de una unidad específica
  const handleInputChange = (index, campo, valor) => {
    setUnidadesForm((prev) => {
      const nuevas = [...prev];
      nuevas[index] = { ...nuevas[index], [campo]: valor };
      return nuevas;
    });
  };

  // Calcular la suma de alícuotas en tiempo real
  const sumaAlicuotas = useMemo(() => {
    return unidadesForm.reduce((total, u) => {
      const val = parseFloat(u.alicuota);
      return total + (isNaN(val) ? 0 : val);
    }, 0);
  }, [unidadesForm]);

  // Función para autocompletar números correlativos
  const handleGeneracionRapida = () => {
    let inicio = parseInt(genInicioNumero, 10);
    if (isNaN(inicio)) {
      setErrorLocal('El número de inicio debe ser válido.');
      return;
    }

    setUnidadesForm((prev) =>
      prev.map((unidad, idx) => ({
        ...unidad,
        bloque_edificio: genBloque.trim(),
        numero: (inicio + idx).toString(),
      }))
    );
    setErrorLocal(null);
  };

  // Validaciones locales antes de enviar al backend
  const validar = () => {
    for (let i = 0; i < unidadesForm.length; i++) {
      const u = unidadesForm[i];
      if (!u.numero.trim()) {
        setErrorLocal(`La unidad #${i + 1} no tiene un número asignado.`);
        return false;
      }
      const alic = parseFloat(u.alicuota);
      if (isNaN(alic) || alic < 0 || alic > 1) {
        setErrorLocal(`La alícuota de la unidad #${i + 1} debe ser un número decimal entre 0 y 1.`);
        return false;
      }
    }

    if (sumaAlicuotas > 1.0001) {
      setErrorLocal(`La suma de las alícuotas (${(sumaAlicuotas * 100).toFixed(2)}%) supera el 100%. Por favor, ajústalas.`);
      return false;
    }

    setErrorLocal(null);
    return true;
  };

  // Guardar todas las unidades
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    try {
      const payload = {
        condominio_id: condominioId,
        unidades: unidadesForm.map((u) => ({
          bloque_edificio: u.bloque_edificio.trim() || null,
          numero: u.numero.trim(),
          alicuota: parseFloat(u.alicuota),
        })),
      };

      await crearLote(payload);
      // Redirigir al detalle del condominio
      router.push(`/dashboard/condominios/${condominioId}`);
    } catch (err) {
      // El hook useUnidades ya actualiza su estado de error, se mostrará abajo
    }
  };

  if (cargandoCondominio || !condominio) {
    return (
      <div className={styles.contenedor}>
        <p className={styles.subtitulo}>Cargando datos del condominio...</p>
      </div>
    );
  }

  // Clases semánticas para el progreso de la alícuota
  const porcentaje = Math.min((sumaAlicuotas * 100), 100);
  let estiloProgreso = styles['progreso--advertencia'];
  let estiloAlerta = styles['alerta--advertencia'];
  let mensajeAlerta = `Suma de alícuotas: ${(sumaAlicuotas * 100).toFixed(2)}% de 100%`;

  if (sumaAlicuotas > 1.0001) {
    estiloProgreso = styles['progreso--error'];
    estiloAlerta = styles['alerta--error'];
    mensajeAlerta = `¡Exceso! La suma de alícuotas es ${(sumaAlicuotas * 100).toFixed(2)}% (máximo 100.00%)`;
  } else if (sumaAlicuotas >= 0.999 && sumaAlicuotas <= 1.0001) {
    estiloProgreso = styles['progreso--exito'];
    estiloAlerta = styles['alerta--exito'];
    mensajeAlerta = 'Suma de alícuotas balanceada (100%)';
  }

  return (
    <div className={`${styles.contenedor} animar-entrada`}>
      <header className={styles.header}>
        <h1 className={styles.titulo}>Inicializar Unidades Vecinales</h1>
        <p className={styles.subtitulo}>
          Condominio: <strong>{condominio.nombre}</strong> — Dirección: {condominio.direccion}
        </p>
      </header>

      {/* --- Barra de Progreso y Balance de Alícuotas --- */}
      <section className={styles.resumenFlotante}>
        <div className={styles.resumenHeader}>
          <div className={styles.resumenInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Unidades a Crear</span>
              <span className={styles.infoValor}>{condominio.cantidad_unidades}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Alícuota por Defecto</span>
              <span className={styles.infoValor}>
                {( (1 / (condominio.cantidad_unidades || 1)) * 100 ).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className={`${styles.alertaAlicuota} ${estiloAlerta}`}>
            {mensajeAlerta}
          </div>
        </div>

        <div className={styles.progresoContenedor}>
          <div
            className={`${styles.barraProgreso} ${estiloProgreso}`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </section>

      {/* --- Herramientas de Generación Rápida --- */}
      <section className={styles.herramientas}>
        <h2 className={styles.herramientasTitulo}>Asistente de Autogeneración Rápida</h2>
        <p className={styles.subtitulo} style={{ fontSize: '0.85rem' }}>
          Completa rápidamente el número de todas las unidades usando un correlativo.
        </p>
        <div className={styles.herramientasFila}>
          <Input
            nombre="genBloque"
            etiqueta="Bloque / Torre Común"
            placeholder="Ej: Torre A (Opcional)"
            valor={genBloque}
            onChange={(e) => setGenBloque(e.target.value)}
          />
          <Input
            nombre="genInicioNumero"
            etiqueta="Número de Inicio"
            tipo="number"
            placeholder="Ej: 101"
            valor={genInicioNumero}
            onChange={(e) => setGenInicioNumero(e.target.value)}
          />
          <Boton variante="secundario" onClick={handleGeneracionRapida}>
            Autocompletar Todo
          </Boton>
        </div>
      </section>

      {/* --- Formulario Principal --- */}
      <form onSubmit={handleSubmit}>
        {errorLocal && <div className={styles.errorGlobal}>{errorLocal}</div>}
        {errorUnidades && <div className={styles.errorGlobal}>{errorUnidades}</div>}

        <div className={styles.gridUnidades}>
          {unidadesForm.map((unidad, index) => (
            <div key={index} className={styles.tarjetaUnidad}>
              <div className={styles.tarjetaUnidadHeader}>
                <span className={styles.tarjetaUnidadTitulo}>Formulario Unidad</span>
                <span className={styles.tarjetaUnidadNumero}>#{index + 1}</span>
              </div>

              <Input
                nombre={`bloque_edificio_${index}`}
                etiqueta="Bloque / Torre"
                placeholder="Ej: Torre A (Opcional)"
                valor={unidad.bloque_edificio}
                onChange={(e) => handleInputChange(index, 'bloque_edificio', e.target.value)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <Input
                  nombre={`numero_${index}`}
                  etiqueta="Número"
                  placeholder="Ej: 101"
                  valor={unidad.numero}
                  onChange={(e) => handleInputChange(index, 'numero', e.target.value)}
                  requerido
                />
                <Input
                  nombre={`alicuota_${index}`}
                  etiqueta="Alícuota"
                  tipo="number"
                  step="0.0001"
                  min="0"
                  max="1"
                  placeholder="0.0833"
                  valor={unidad.alicuota}
                  onChange={(e) => handleInputChange(index, 'alicuota', e.target.value)}
                  requerido
                />
              </div>
            </div>
          ))}
        </div>

        <footer className={styles.barraAcciones}>
          <Boton
            variante="fantasma"
            onClick={() => router.push('/dashboard/condominios')}
            deshabilitado={guardando}
          >
            Cancelar y Volver
          </Boton>
          <Boton variante="primario" tipo="submit" cargando={guardando}>
            Guardar Todas las Unidades
          </Boton>
        </footer>
      </form>
    </div>
  );
}
