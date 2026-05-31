// =============================================================================
// SUMA — Layout Raíz (Next.js App Router)
// =============================================================================

import './globals.css';

export const metadata = {
  title: {
    default: 'SUMA — Gestión y Cohesión Comunitaria',
    template: '%s | SUMA',
  },
  description: 'Plataforma PropTech para administrar gastos comunes, conectar con vecinos y fortalecer tu comunidad en Arica, Chile.',
  keywords: ['condominio', 'gastos comunes', 'administración', 'comunidad', 'Arica', 'Chile', 'PropTech', 'vecinos'],
  authors: [{ name: 'ComunidApp SpA' }],
  creator: 'ComunidApp SpA',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'SUMA — Gestión Comunitaria',
    title: 'SUMA — Gestión y Cohesión Comunitaria',
    description: 'Plataforma PropTech para administrar gastos comunes, conectar con vecinos y fortalecer tu comunidad en Arica, Chile.',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'SUMA — Plataforma de gestión comunitaria',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SUMA — Gestión y Cohesión Comunitaria',
    description: 'Plataforma PropTech para administradores de condominios en Arica, Chile.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function LayoutRaiz({ children }) {
  return (
    <html lang="es-CL">
      <body>
        {children}
      </body>
    </html>
  );
}