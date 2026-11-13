import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { esErrorCredenciales, iniciarSesionConClave } from "../../services/authService";

export default function LoginScreen() {
  const [clave, setClave] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  const manejarEnvio = async (event) => {
    event.preventDefault();
    if (procesando) return;
    setProcesando(true);
    setError("");
    try {
      await iniciarSesionConClave(clave);
      setClave("");
    } catch (loginError) {
      if (esErrorCredenciales(loginError)) {
        setError("Clave incorrecta. Inténtalo nuevamente");
      } else {
        const message = "No se pudo iniciar sesión. Verifica tu conexión e inténtalo nuevamente.";
        setError(message);
        toast.error(message);
      }
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="login-container">
      <motion.section
        className="card login-card"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={error ? {
          opacity: 1,
          y: 0,
          scale: 1,
          x: [0, -7, 7, -5, 5, 0]
        } : { opacity: 1, y: 0, scale: 1, x: 0 }}
        transition={error
          ? { duration: 0.34, ease: "easeOut" }
          : { type: "spring", stiffness: 190, damping: 22 }}
      >
        <img
          className="login-logo"
          src="/logo-tulio-store.png"
          alt="Tulio Store — Ropa y accesorios en las mejores marcas originales"
        />
        <form onSubmit={manejarEnvio}>
          <div className="password-wrapper">
            <input
              type={mostrarClave ? "text" : "password"}
              placeholder="Clave de acceso"
              aria-label="Clave de acceso"
              autoComplete="current-password"
              value={clave}
              onChange={(event) => {
                setClave(event.target.value);
                setError("");
              }}
              required
              autoFocus
            />
            <motion.button
              type="button"
              className="btn-eye"
              onClick={() => setMostrarClave((visible) => !visible)}
              aria-label={mostrarClave ? "Ocultar clave" : "Mostrar clave"}
              whileTap={{ scale: 0.9 }}
            >
              {mostrarClave ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.button>
          </div>
          <AnimatePresence mode="wait">
          {error && (
            <motion.p
              className="error-msg"
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {error}
            </motion.p>
          )}
          </AnimatePresence>
          <motion.button type="submit" className="btn-primary" disabled={procesando || !clave} whileTap={{ scale: 0.985 }}>
            <Lock size={16} /> {procesando ? "Verificando..." : "Ingresar"}
          </motion.button>
        </form>
      </motion.section>
    </div>
  );
}
