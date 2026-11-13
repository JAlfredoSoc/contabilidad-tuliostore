import { X } from "lucide-react";
import { motion } from "framer-motion";

export default function Modal({ title, children, onClose, wide = false }) {
  return (
    <motion.div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.section
        className={`card modal-card${wide ? " modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
      >
        <header className="modal-header">
          <h3>{title}</h3>
          {onClose && (
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">
              <X size={20} />
            </button>
          )}
        </header>
        {children}
      </motion.section>
    </motion.div>
  );
}
