// =============================================================================
// SUMA — Componente Calendario
// Renderiza un mes con píldoras de eventos.
// =============================================================================

'use client';

import { useState } from 'react';
import Modal from './Modal.jsx';
import Boton from './Boton.jsx';
import styles from './Calendario.module.css';

/**
 * Retorna la cantidad de días de un mes y año específicos.
 */
function obtenerDiasEnMes(mes, anio) {
  return new Date(anio, mes + 1, 0).getDate();
}

/**
 * Retorna el día de la semana (0 = Domingo, 6 = Sábado) del primer día del mes.
 */
function obtenerPrimerDiaDelMes(mes, anio) {
  return new Date(anio, mes, 1).getDay();
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Componente de Calendario.
 * Recibe un array de eventos: [{ id, fecha, titulo, tipo }]
 * donde fecha es un string ISO (ej: '2026-06-15').
 */
export default function Calendario({ eventos = [] }) {
  const hoy = new Date();
  const [fechaBase, setFechaBase] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const anioActual = fechaBase.getFullYear();
  const mesActual = fechaBase.getMonth();

  const totalDias = obtenerDiasEnMes(mesActual, anioActual);
  const primerDia = obtenerPrimerDiaDelMes(mesActual, anioActual);

  // Navegación
  const irMesAnterior = () => {
    setFechaBase(new Date(anioActual, mesActual - 1, 1));
  };

  const irMesSiguiente = () => {
    setFechaBase(new Date(anioActual, mesActual + 1, 1));
  };

  const irHoy = () => {
    setFechaBase(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  };

  // Construir celdas de la cuadrícula
  const celdas = [];
  
  // Rellenar días en blanco previos al inicio del mes
  for (let i = 0; i < primerDia; i++) {
    celdas.push(<div key={`vacio-${i}`} className={`${styles.celdaDia} ${styles.celdaVacia}`} />);
  }

  // Rellenar días del mes
  for (let dia = 1; dia <= totalDias; dia++) {
    const fechaString = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    
    // Filtrar eventos de este día
    const eventosDelDia = eventos.filter(e => {
      if (!e.fecha) return false;
      return e.fecha.startsWith(fechaString);
    });

    const esHoy = 
      dia === hoy.getDate() && 
      mesActual === hoy.getMonth() && 
      anioActual === hoy.getFullYear();

    celdas.push(
      <div 
        key={`dia-${dia}`} 
        className={`${styles.celdaDia} ${esHoy ? styles.diaActual : ''} ${styles.celdaClickeable}`}
        onClick={() => setDiaSeleccionado({ dia, mes: mesActual, anio: anioActual, eventos: eventosDelDia })}
      >
        <span className={styles.numeroDia}>{dia}</span>
        <div className={styles.listaEventos}>
          {eventosDelDia.map(evento => (
            <div 
              key={evento.id} 
              className={`${styles.evento} ${styles[`evento_${evento.tipo}`] || styles.evento_recordatorio}`}
              title={evento.titulo}
            >
              {evento.titulo}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Rellenar días en blanco posteriores para cuadrar la última fila
  const totalCeldas = celdas.length;
  const celdasFaltantes = (7 - (totalCeldas % 7)) % 7;
  for (let i = 0; i < celdasFaltantes; i++) {
    celdas.push(<div key={`vacio-fin-${i}`} className={`${styles.celdaDia} ${styles.celdaVacia}`} />);
  }

  return (
    <div className={styles.calendarioContenedor}>
      {/* Cabecera */}
      <div className={styles.cabecera}>
        <h3 className={styles.tituloMes}>
          {MESES[mesActual]} {anioActual}
        </h3>
        <div className={styles.navegacion}>
          <button onClick={irMesAnterior} className={styles.botonNav} aria-label="Mes anterior">
            ◀
          </button>
          <button onClick={irHoy} className={`${styles.botonNav} ${styles.botonHoy}`}>
            Hoy
          </button>
          <button onClick={irMesSiguiente} className={styles.botonNav} aria-label="Mes siguiente">
            ▶
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className={styles.diasSemana}>
        {DIAS_SEMANA.map(dia => (
          <div key={dia} className={styles.diaSemana}>
            {dia}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div className={styles.cuadricula}>
        {celdas}
      </div>

      {/* Modal de Detalle del Día */}
      <Modal
        abierto={!!diaSeleccionado}
        onCerrar={() => setDiaSeleccionado(null)}
        titulo={`Eventos del ${diaSeleccionado?.dia} de ${diaSeleccionado ? MESES[diaSeleccionado.mes] : ''} ${diaSeleccionado?.anio}`}
        tamano="md"
        acciones={
          <Boton variante="fantasma" onClick={() => setDiaSeleccionado(null)}>
            Cerrar
          </Boton>
        }
      >
        <div className={styles.modalContenido}>
          {diaSeleccionado?.eventos?.length > 0 ? (
            <ul className={styles.listaModal}>
              {diaSeleccionado.eventos.map(evento => (
                <li key={evento.id} className={styles.itemModal}>
                  <div className={`${styles.indicadorModal} ${styles[`evento_${evento.tipo}`] || styles.evento_recordatorio}`} />
                  <div className={styles.detalleModal}>
                    <strong>{evento.titulo}</strong>
                    <span className={styles.tipoModal}>{evento.tipo}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.vacioModal}>
              <span className={styles.vacioIcono}>🏖️</span>
              <p>No hay eventos ni acciones registradas en este día.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
