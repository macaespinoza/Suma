/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimización para despliegue en Cloud Run (output standalone).
  output: 'standalone',

  // Variables de entorno públicas accesibles desde el cliente.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Configuración de imágenes remotas (Cloud Storage).
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/suma-archivos/**',
      },
    ],
  },
};

export default nextConfig;
