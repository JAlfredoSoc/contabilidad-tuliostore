import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import AuditLogModal from "./components/audit/AuditLogModal";
import LoginScreen from "./components/auth/LoginScreen";
import Navbar from "./components/common/Navbar";
import DashboardView from "./components/dashboard/DashboardView";
import SalesHistoryView from "./components/history/SalesHistoryView";
import RegisterSaleView from "./components/sales/RegisterSaleView";
import useAuth from "./hooks/useAuth";
import useVentasData from "./hooks/useVentasData";
import { anularVenta, crearVenta, editarVenta } from "./services/ventasService";
import { obtenerFechaColombiaISO } from "./utils/dateUtils";
import { exportarVentasCSV } from "./utils/exportUtils";

export default function App() {
  const { usuario, cargando: authCargando, error: authError, cerrarSesion } = useAuth();
  const { ventas, auditoria, cargando: datosCargando, error: datosError } = useVentasData(usuario);
  const [moduloActivo, setModuloActivo] = useState("dashboard");
  const [rangoInicio, setRangoInicio] = useState(() => {
    const hoy = obtenerFechaColombiaISO();
    return `${hoy.slice(0, 7)}-01`;
  });
  const [rangoFin, setRangoFin] = useState(obtenerFechaColombiaISO);
  const [auditoriaAbierta, setAuditoriaAbierta] = useState(false);

  useEffect(() => {
    if (datosError) toast.error(datosError);
  }, [datosError]);

  const ejecutarAccion = async (accion, exito) => {
    await accion();
    if (exito) toast.success(exito);
  };

  const exportar = () => {
    if (rangoInicio > rangoFin) {
      toast.error("La fecha inicial debe ser anterior a la fecha final.");
      return;
    }
    if (!exportarVentasCSV(ventas, rangoInicio, rangoFin)) {
      toast.info("No hay ventas vigentes en el rango seleccionado para exportar.");
      return;
    }
    toast.success("Reporte de ventas descargado.");
  };

  const salir = async () => {
    try {
      await cerrarSesion();
    } catch (error) {
      toast.error(error.message || "No se pudo cerrar la sesión.");
    }
  };

  if (authCargando) {
    return <main className="container min-h-screen"><p className="empty">Verificando sesión...</p></main>;
  }
  if (!usuario) {
    return (
      <>
        <LoginScreen />
        {authError && <p className="auth-error" role="alert">{authError}</p>}
      </>
    );
  }

  return (
    <main className="container min-h-screen">
      <Navbar
        moduloActivo={moduloActivo}
        onNavigate={setModuloActivo}
        onExport={exportar}
        onAudit={() => setAuditoriaAbierta(true)}
        onLogout={salir}
        auditOpen={auditoriaAbierta}
      />
      {datosCargando && <div className="alert-warning" role="status">Sincronizando datos con Firebase...</div>}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={moduloActivo}
          className="view-transition"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {moduloActivo === "dashboard" && (
            <DashboardView
              ventas={ventas}
              rangoInicio={rangoInicio}
              rangoFin={rangoFin}
              onRangoInicio={setRangoInicio}
              onRangoFin={setRangoFin}
            />
          )}
          {moduloActivo === "registrar" && (
            <RegisterSaleView onSave={(venta, operationId) =>
              ejecutarAccion(() => crearVenta(venta, operationId), "Venta registrada correctamente.")
            } />
          )}
          {moduloActivo === "historial" && (
            <SalesHistoryView
              ventas={ventas}
              auditoria={auditoria}
              onEdit={(venta, valores, motivo) =>
                ejecutarAccion(() => editarVenta(venta, valores, motivo), "Venta actualizada correctamente.")
              }
              onVoid={(venta) => ejecutarAccion(() => anularVenta(venta), "Venta anulada correctamente.")}
            />
          )}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
      {auditoriaAbierta && (
        <AuditLogModal auditoria={auditoria} onClose={() => setAuditoriaAbierta(false)} />
      )}
      </AnimatePresence>
    </main>
  );
}
