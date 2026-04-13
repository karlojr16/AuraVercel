import admin from 'firebase-admin';

let _app: admin.app.App | null = null;

function getApp(): admin.app.App {
  if (_app) return _app;
  if (admin.apps.length > 0) {
    _app = admin.apps[0]!;
    return _app;
  }

  // Netlify serializa la private_key escapando los saltos de línea.
  // Hay que convertir \\n → \n para que sea válida.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      'aurabot-f57b2.firebasestorage.app',
  });

  return _app;
}

// adminDb y adminStorage se obtienen solo cuando se llaman (runtime, no build-time)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adminDb: admin.firestore.Firestore = new Proxy({} as any, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(_t, prop: string) {
    return (getApp().firestore() as any)[prop];
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adminStorage: admin.storage.Storage = new Proxy({} as any, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(_t, prop: string) {
    return (getApp().storage() as any)[prop];
  },
});
