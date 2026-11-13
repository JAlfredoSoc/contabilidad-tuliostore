import {
  Download,
  History,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  PlusCircle
} from "lucide-react";
import { motion } from "framer-motion";

const TABS = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "registrar", label: "Registrar venta", Icon: PlusCircle },
  { id: "historial", label: "Historial de ventas", Icon: ListOrdered }
];

export default function Navbar({ moduloActivo, onNavigate, onExport, onAudit, onLogout, auditOpen }) {
  return (
    <>
      <motion.header
        className="top-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="brand-title">
          <img
            className="brand-logo"
            src="/logo-tulio-store.png"
            alt="Tulio Store — Ropa y accesorios en las mejores marcas originales"
          />
        </div>
        <div className="header-actions">
          <button type="button" className="btn-secondary" onClick={onExport} title="Descargar CSV">
            <Download size={16} /><span className="hide-mobile">Exportar</span>
          </button>
          <button
            type="button"
            className={`btn-secondary ${auditOpen ? "active" : ""}`}
            onClick={onAudit}
            aria-pressed={auditOpen}
          >
            <History size={16} /><span className="hide-mobile">Auditoría</span>
          </button>
          <button type="button" className="btn-secondary danger-hover" onClick={onLogout} title="Cerrar sesión">
            <LogOut size={16} />
          </button>
        </div>
      </motion.header>
      <nav className="nav-tabs" aria-label="Navegación principal">
        {TABS.map(({ id, label, Icon }) => (
          <motion.button
            type="button"
            key={id}
            className={`nav-tab ${moduloActivo === id ? "active" : ""}`}
            onClick={() => onNavigate(id)}
            aria-current={moduloActivo === id ? "page" : undefined}
            whileTap={{ scale: 0.97 }}
          >
            {moduloActivo === id && (
              <motion.span
                className="active-tab-pill"
                layoutId="activeTab"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="nav-tab-content">
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </span>
          </motion.button>
        ))}
      </nav>
    </>
  );
}
