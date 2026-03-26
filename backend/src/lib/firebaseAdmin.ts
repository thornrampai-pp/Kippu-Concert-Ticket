import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { ENV } from "../config/env.js";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: ENV.PROJECT_ID,
      clientEmail: ENV.CLIENT_EMAIL,
      privateKey: ENV.PRIVATEKEY.replace(/\\n/g, "\n"),
    }),
  });
}

export const auth = getAuth();