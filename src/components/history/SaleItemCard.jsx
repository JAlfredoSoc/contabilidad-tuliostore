import { Ban, Check, Copy, Edit2, FileText, History } from "lucide-react";
import { motion } from "framer-motion";
import { obtenerFechaColombiaISO, formatearFechaLegible, formatearTimestampColombia } from "../../utils/dateUtils";
import { formatoCOP } from "../../utils/formatters";
import StatusBadge from "../common/StatusBadge";

export default function SaleItemCard({ venta, copiado, onCopy, onDetails, onAudit, onEdit, onVoid }) {
  const anulada = venta.estado === "Anulada";
  const fechaRegistro = venta.fechaRegistro?.toDate
    ? obtenerFechaColombiaISO(venta.fechaRegistro.toDate())
    : venta.fechaVenta;
  const fueDiferida = fechaRegistro && fechaRegistro !== venta.fechaVenta;

  return (
    <motion.article
      className={`venta-item ${anulada ? "venta-anulada" : ""}`}
      layout
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
        exit: { opacity: 0, y: -6, scale: 0.985 }
      }}
      whileHover={{ y: -1 }}
    >
      <div className="venta-info">
        <div className="venta-titulo"><strong>{venta.descripcion}</strong></div>
        <div className="tags">
          <StatusBadge variant={anulada ? "badge-anulada" : "badge-vigente"}>{venta.estado}</StatusBadge>
          <StatusBadge variant="pago">{venta.metodoPago}</StatusBadge>
          <StatusBadge>Venta: {formatearFechaLegible(venta.fechaVenta)}</StatusBadge>
          {fueDiferida && <StatusBadge variant="editado">Registrada: {formatearTimestampColombia(venta.fechaRegistro)}</StatusBadge>}
        </div>
      </div>
      <div className="venta-derecha">
        <span className={`precio ${anulada ? "tachado" : ""}`}>{formatoCOP(venta.valor)}</span>
        <button type="button" className="btn-icon" title="Copiar valor" aria-label="Copiar valor" onClick={onCopy}>
          {copiado ? <Check size={15} className="icon-accent" /> : <Copy size={15} />}
        </button>
        <button type="button" className="btn-icon" title="Ver detalles" aria-label="Ver detalles" onClick={onDetails}>
          <FileText size={16} />
        </button>
        <button type="button" className="btn-icon" title="Historial de auditoría" aria-label="Historial de auditoría" onClick={onAudit}>
          <History size={16} />
        </button>
        {!anulada && (
          <>
            <button type="button" className="btn-icon edit" title="Editar venta" aria-label="Editar venta" onClick={onEdit}>
              <Edit2 size={16} />
            </button>
            <button type="button" className="btn-icon del" title="Anular venta" aria-label="Anular venta" onClick={onVoid}>
              <Ban size={16} />
            </button>
          </>
        )}
      </div>
    </motion.article>
  );
}
