// =============================================================================
// SUMA — Mock Auth Store para Desarrollo Local
// Simula Firebase Auth sin necesidad de credentials reales.
// SOLO para uso en NODE_ENV=development.
// =============================================================================

const DEV_MOCK_USER = {
  uid: 'dev-test-uid-123',
  email: 'demo@suma.cl',
  displayName: 'Usuario Demo',
  idToken: 'dev-mock-token-12345',
};

const DEV_USERS = [
  { email: 'demo@suma.cl', password: 'demo123', name: 'Usuario Demo', rol: 'admin' },
  { email: 'maria.fernandez@email.cl', password: 'maria123', name: 'María Fernández López', rol: 'admin' },
  { email: 'carlos.munoz@email.cl', password: 'carlos123', name: 'Carlos Muñoz Rojas', rol: 'propietario' },
];

let currentUser = null;

export const mockAuth = {
  get currentUser() {
    return currentUser;
  },

  async signInWithEmailAndPassword(email, password) {
    const user = DEV_USERS.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('auth/invalid-credential');
    }
    currentUser = {
      uid: DEV_MOCK_USER.uid,
      email: user.email,
      displayName: user.name,
      rol: user.rol,
      getIdToken: async () => DEV_MOCK_USER.idToken,
    };
    return { user: currentUser };
  },

  async signOut() {
    currentUser = null;
  },

  onAuthStateChanged(callback) {
    callback(currentUser);
    return () => {};
  },
};

export default mockAuth;