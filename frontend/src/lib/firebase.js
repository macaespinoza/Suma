// =============================================================================
// SUMA — Configuración de Firebase (Client SDK)
// Inicialización del SDK de Firebase para el frontend.
// Open Code implementará los flujos de autenticación sobre esta base.
// =============================================================================

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Configuración del proyecto Firebase.
 * Valores se leen de las variables de entorno (NEXT_PUBLIC_*).
 */
const configFirebase = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Inicialización con protección contra re-inicialización.
 * En Next.js (App Router), los módulos pueden re-evaluarse durante HMR.
 */
const app = getApps().length === 0
  ? initializeApp(configFirebase)
  : getApps()[0];

/**
 * Servicios de Firebase exportados:
 *
 * - auth: Para login/logout, verificación de email, etc.
 *   Open Code usará: signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged
 *
 * - firestore: Para likes, comentarios y notificaciones en tiempo real.
 *   Nota Arquitectónica: Solo las interacciones rápidas van a Firestore.
 *   Los datos estructurales (condominios, usuarios, pagos) viven en PostgreSQL.
 */
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;
