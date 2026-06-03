// =============================================================================
// SUMA — Página de Listado de Unidades Vecinales
// Muestra tabla de unidades con badges visuales de estacionamiento y bodega.
// =============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCondominios } from '../../../../../lib/hooks/useCondominios.js';
import Tabla from '../../../../../componentes/ui/Tabla.jsx';
import Boton from '../../../../../componentes/ui/Boton.jsx';
import { ArrowLeft } from '@phosphor-icons/react';
import styles from './page.module.css';

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
  {
    clave: 'tiene_estacionamiento',
    etiqueta: 'Estac.',
    render: (valor, fila) => (
      <span className={`${styles.badge} ${valor ? styles.badgeActivo : styles.badgeInactivo}`}>
        {valor ? `P${fila.numero_estacionamiento ? ` ${fila.numero_estacionamiento}` : ''}` : '—'}
      </span>
    ),
  },
  {
    clave: 'tiene_bodega',
    etiqueta: 'Bodega',
    render: (valor, fila) => (
      <span className={`${styles.badge} ${valor ? styles.badgeActivo : styles.badgeInactivo}`}>
        {valor ? `B${fila.numero_bodega ? ` ${fila.numero_bodega}` : ''}` : '—'}
      </span>
    ),
  },
];

export default function PaginaUnidades() {
  const router = useRouter();
  const { id: condominioId } = useParams();
  const { listarUnidades, cargando, error, obtenerPorId } = useCondominios();
  const [unidades, setUnidades] = useState([]);
  const [condominio, setCondominio] = useState(null);

  useEffect(() => {
    if (condominioId) {
      obtenerPorId(condominioId).then(setCondominio);
      listarUnidades(condominioId).then((datos) => setUnidades(datos || []));
    }
  }, [condominioId, listarUnidades, obtenerPorId]);

  return (
    <div className={`${styles.pagina} animar-entrada`}>
      <div className={styles.cabecera}>
        <div>
          <Boton variante="fantasma" onClick={() => router.push(`/dashboard/condominios/${condominioId}`)}>
            <><ArrowLeft size={16} weight="bold" /> Volver al condominio</>
          </Boton>
          <h1 className={styles.titulo}>
            Unidades Vecinales
            {condominio && <span className={styles.subtitulo}> — {condominio.nombre}</span>}
          </h1>
        </div>
        <div className={styles.acciones}>
          <Boton
            variante="secundario"
            tamano="sm"
            onClick={() => router.push(`/dashboard/condominios/${condominioId}/unidades/inicializar`)}
          >
            Inicializar en Lote
          </Boton>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <Tabla
        columnas={columnasUnidades}
        datos={unidades}
        cargando={cargando}
        vacioTexto="Este condominio no tiene unidades registradas."
        onFilaClick={(fila) => router.push(`/dashboard/condominios/${condominioId}/unidades/${fila.id}`)}
      />
    </div>
  );
}
