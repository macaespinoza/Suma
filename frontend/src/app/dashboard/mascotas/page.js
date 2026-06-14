'use client';
import { useState, useEffect } from 'react';
import { Dog, Cat, Plus, Syringe, Heart, ArrowLeft } from '@phosphor-icons/react';
import api from '../../../lib/api';
import styles from './page.module.css';

const especieIcono = (especie) => especie === 'Perro' ? <Dog size={20} weight="fill" /> : <Cat size={20} weight="fill" />;

export default function PaginaMascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  const [modal, setModal] = useState(false);
  const [nueva, setNueva] = useState({ nombre: '', especie: 'Perro', raza: '', edad: '' });

  useEffect(() => {
    api.get('/condominios/condo-chimchorro/mascotas').then(d => { setMascotas(d.datos || []); setCargando(false); }).catch(() => setCargando(false));
  }, []);

  const mascotasFiltradas = filtro === 'todas' ? mascotas : mascotas.filter(m => m.especie === filtro);
  const totalPerros = mascotas.filter(m => m.especie === 'Perro').length;
  const totalGatos = mascotas.filter(m => m.especie === 'Gato').length;

  return (
    <div className={styles.pagina}>
      <a href="/dashboard" className={styles.botonVolver}><ArrowLeft size={16} /> Volver</a>
      <header className={styles.cabecera}>
        <div>
          <h1 className={styles.titulo}>Mascotas del Condominio</h1>
          <p className={styles.subtitulo}>Registro Pet-Friendly • {mascotas.length} mascotas activas</p>
        </div>
        <button className={styles.botonPrimario} onClick={() => setModal(true)}><Plus size={16} weight="bold" /> Registrar Mascota</button>
      </header>

      <div className={styles.stats}>
        <div className={styles.statCard}><Dog size={28} weight="fill" /><div><span className={styles.statNum}>{totalPerros}</span><span className={styles.statLabel}>Perros</span></div></div>
        <div className={styles.statCard}><Cat size={28} weight="fill" /><div><span className={styles.statNum}>{totalGatos}</span><span className={styles.statLabel}>Gatos</span></div></div>
        <div className={styles.statCard}><Syringe size={28} weight="fill" /><div><span className={styles.statNum}>{mascotas.filter(m => m.vacunas_al_dia).length}</span><span className={styles.statLabel}>Vacunas al día</span></div></div>
        <div className={styles.statCard}><Heart size={28} weight="fill" /><div><span className={styles.statNum}>{mascotas.filter(m => m.esterilizado).length}</span><span className={styles.statLabel}>Esterilizados</span></div></div>
      </div>

      <div className={styles.filtros}>
        {['todas', 'Perro', 'Gato'].map(f => (
          <button key={f} className={`${styles.filtro} ${filtro === f ? styles.filtroActivo : ''}`} onClick={() => setFiltro(f)}>{f === 'todas' ? 'Todas' : f === 'Perro' ? 'Perros' : 'Gatos'}</button>
        ))}
      </div>

      {cargando ? <p className={styles.cargando}>Cargando mascotas...</p> : (
        <div className={styles.grid}>
          {mascotasFiltradas.map(m => (
            <article key={m.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>{especieIcono(m.especie)}</div>
                <div><h3 className={styles.nombre}>{m.nombre}</h3><p className={styles.raza}>{m.raza} · {m.edad}</p></div>
              </div>
              <div className={styles.info}>
                <div className={styles.infoItem}><span>Dueño</span><strong>{m.dueno.nombre}</strong></div>
                <div className={styles.infoItem}><span>Unidad</span><strong>{m.dueno.unidad}</strong></div>
                <div className={styles.infoItem}><span>Sexo</span><strong>{m.sexo}</strong></div>
                <div className={styles.infoItem}><span>Peso</span><strong>{m.peso}</strong></div>
              </div>
              <div className={styles.badges}>
                {m.vacunas_al_dia && <span className={styles.badgeOk}><Syringe size={12} /> Vacunas al día</span>}
                {m.esterilizado && <span className={styles.badgeOk}><Heart size={12} /> Esterilizado</span>}
              </div>
            </article>
          ))}
        </div>
      )}

      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Registrar Nueva Mascota</h3>
            <form onSubmit={e => { e.preventDefault(); alert('Mascota registrada (demo)'); setModal(false); }}>
              <input className={styles.input} placeholder="Nombre" value={nueva.nombre} onChange={e => setNueva({...nueva, nombre: e.target.value})} required />
              <select className={styles.input} value={nueva.especie} onChange={e => setNueva({...nueva, especie: e.target.value})}><option>Perro</option><option>Gato</option><option>Otro</option></select>
              <input className={styles.input} placeholder="Raza" value={nueva.raza} onChange={e => setNueva({...nueva, raza: e.target.value})} />
              <input className={styles.input} placeholder="Edad" value={nueva.edad} onChange={e => setNueva({...nueva, edad: e.target.value})} />
              <div className={styles.modalAcciones}>
                <button type="button" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className={styles.botonPrimario}>Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
