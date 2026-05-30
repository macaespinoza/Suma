// =============================================================================
// SUMA — Inicialización de Firebase Admin SDK
// Provee autenticación (verificación de tokens JWT) y acceso a Firestore.
// =============================================================================

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Inicialización condicional:
 * - En GCP (Cloud Run): usa Application Default Credentials automáticamente.
 * - En desarrollo local: usa el archivo JSON de la cuenta de servicio.
 */
let credencial;

if (process.env.NODE_ENV === 'production') {
  // En Cloud Run, las credenciales se inyectan automáticamente.
  credencial = applicationDefault();
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // En desarrollo local con archivo de cuenta de servicio.
  // La variable GOOGLE_APPLICATION_CREDENTIALS apunta al JSON.
  credencial = applicationDefault();
} else {
  console.warn('⚠️  Firebase Admin: No se encontraron credenciales. Algunas funciones estarán deshabilitadas.');
  credencial = undefined;
}

const appFirebase = initializeApp({
  credential: credencial,
  projectId: process.env.FIREBASE_PROJECT_ID,
});

// Servicios de Firebase Admin exportados para uso en middlewares y servicios.
export const authAdmin = getAuth(appFirebase);
export const firestoreAdmin = getFirestore(appFirebase);

export default appFirebase;
