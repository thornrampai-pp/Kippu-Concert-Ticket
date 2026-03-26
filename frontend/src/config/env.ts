
export const ENV = {
  API_URL: process.env.BACKEND_URL,
  FIREBASE: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  SUPABASE:{
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }
};