import * as admin from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { ENV } from '../config/env';

// Check if any apps are already initialized using getApps()
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: ENV.PROJECT_ID,
      clientEmail: ENV.CLIENT_EMAIL,
      // Important: Ensure newlines in private keys are handled
      privateKey: ENV.PRIVATEKEY.replace(/\\n/g, '\n'),
    }),
  });
}

export default admin;