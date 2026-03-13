// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCD5z83awRhwb3Dwva-E4P_Us2n2f6gvHY",
  authDomain: "kippu-ticket-concert-f2e40.firebaseapp.com",
  projectId: "kippu-ticket-concert-f2e40",
  storageBucket: "kippu-ticket-concert-f2e40.firebasestorage.app",
  messagingSenderId: "102284897685",
  appId: "1:102284897685:web:5c2a9862b63b802e9ada9c"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();