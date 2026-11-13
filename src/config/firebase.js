import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCq7SQ1O_jK30wiX4VqLX-6u8a110iB_Uw",
  authDomain: "tulio-store-contabilidad.firebaseapp.com",
  projectId: "tulio-store-contabilidad",
  storageBucket: "tulio-store-contabilidad.firebasestorage.app",
  messagingSenderId: "916927778454",
  appId: "1:916927778454:web:ca9618707b527533bb3cb7",
  measurementId: "G-BTRB75JCCM"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
