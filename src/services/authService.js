import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth } from "../config/firebase";
import { EMAIL_TECNICO } from "../constants/storeConfig";

export const iniciarSesionConClave = (clave) =>
  signInWithEmailAndPassword(auth, EMAIL_TECNICO, clave);

export const cerrarSesion = () => signOut(auth);
export const suscribirEstadoAuth = (callback, onError) =>
  onAuthStateChanged(auth, callback, onError);

export const esErrorCredenciales = (error) =>
  ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "auth/invalid-email"]
    .includes(error?.code);
