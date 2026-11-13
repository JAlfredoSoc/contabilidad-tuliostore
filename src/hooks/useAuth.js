import { useEffect, useState } from "react";
import { cerrarSesion, suscribirEstadoAuth } from "../services/authService";

export default function useAuth() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => suscribirEstadoAuth(
    (currentUser) => {
      setUsuario(currentUser);
      setCargando(false);
      setError("");
    },
    (authError) => {
      setError(authError.message || "No se pudo verificar la sesión.");
      setCargando(false);
    }
  ), []);

  return { usuario, cargando, error, cerrarSesion };
}
