// =============================================================================
// SUMA — Configuración Principal de Express
// Middlewares globales, montaje de rutas y manejador de errores.
// =============================================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import enrutadorPrincipal from './rutas/index.js';
import { manejarError } from './middlewares/errores.js';

const app = express();

// ---------------------------------------------------------------------------
// Middlewares Globales
// ---------------------------------------------------------------------------

// Seguridad: headers HTTP seguros (XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet());

// CORS: permite peticiones desde el frontend.
const origenesPermitidos = (process.env.CORS_ORIGENES_PERMITIDOS || 'http://localhost:3000')
  .split(',')
  .map(origen => origen.trim());

app.use(cors({
  origin: origenesPermitidos,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Parseo de JSON con límite de tamaño.
app.use(express.json({ limit: '1mb' }));

// Logging de peticiones HTTP (formato compacto en prod, detallado en dev).
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ---------------------------------------------------------------------------
// Health Check (requerido por Cloud Run)
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.status(200).json({ estado: 'ok', servicio: 'suma-backend' });
});

// ---------------------------------------------------------------------------
// Archivos Estáticos (Comprobantes locales)
// ---------------------------------------------------------------------------
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ---------------------------------------------------------------------------
// Montaje de Rutas
// ---------------------------------------------------------------------------
app.use('/api/v1', enrutadorPrincipal);

// ---------------------------------------------------------------------------
// Ruta No Encontrada (404)
// ---------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({
    exito: false,
    error: {
      codigo: 404,
      mensaje: 'Recurso no encontrado.',
    },
  });
});

// ---------------------------------------------------------------------------
// Manejador Global de Errores
// ---------------------------------------------------------------------------
app.use(manejarError);

export default app;
