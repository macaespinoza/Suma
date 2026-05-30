// =============================================================================
// SUMA — Layout Raíz (Next.js App Router)
// Define la estructura HTML base, metadata SEO y fuente principal.
// =============================================================================

import './globals.css';

export const metadata = {
  title: {
    default: 'SUMA — Gestión Comunitaria',
    template: '%s | SUMA',
  },
  description: 'Plataforma PropTech de gestión y cohesión comunitaria para condominios en Arica, Chile. Administra gastos comunes, fomenta la vida vecinal y fortalece tu comunidad.',
  keywords: ['condominio', 'gastos comunes', 'administración', 'comunidad', 'Arica', 'Chile', 'PropTech'],
  authors: [{ name: 'ComunidApp' }],
  openGraph: {
    title: 'SUMA — Gestión Comunitaria',
    description: 'Plataforma PropTech de gestión y cohesión comunitaria para condominios en Arica, Chile.',
    type: 'website',
    locale: 'es_CL',
  },
};

/**
 * Layout raíz de la aplicación.
 * Envuelve todas las páginas con la estructura HTML base.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenido de la página actual.
 */
export default function LayoutRaiz({ children }) {
  return (
    <html lang="es-CL">
      <body>
        {children}
      </body>
    </html>
  );
}
