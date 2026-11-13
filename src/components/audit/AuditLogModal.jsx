import { formatearTimestampColombia } from "../../utils/dateUtils";
import { formatoCOP } from "../../utils/formatters";
import Modal from "../common/Modal";

const describirValores = (valores) => {
  if (!valores) return "";
  return [
    valores.descripcion && `"${valores.descripcion}"`,
    valores.valor !== undefined && formatoCOP(valores.valor),
    valores.metodoPago,
    valores.fechaVenta
  ].filter(Boolean).join(" • ");
};

export default function AuditLogModal({ auditoria, ventaId, onClose }) {
  const logs = auditoria.filter((log) => !ventaId || log.ventaId === ventaId);
  return (
    <Modal
      title={ventaId ? "Historial de Cambios de la Venta" : "Auditoría General del Sistema"}
      onClose={onClose}
      wide
    >
      {!logs.length ? (
        <p className="empty">Aún no hay eventos registrados.</p>
      ) : (
        <div className="logs-list">
          {logs.map((log) => (
            <article key={log.id} className={`log-item ${log.accion?.toLowerCase()}`}>
              <div className="log-header">
                <div>
                  <span className="log-badge">{log.accion}</span>
                  {!ventaId && <span className="log-id">ID: {log.ventaId?.slice(0, 8)}...</span>}
                </div>
                <small>{formatearTimestampColombia(log.fechaServidor)}</small>
              </div>
              <p><strong>Usuario:</strong> {log.usuario || "Desconocido"} • <strong>Motivo:</strong> {log.motivo || "—"}</p>
              {log.camposAfectados?.length > 0 && (
                <small className="log-diff">Campos afectados: {log.camposAfectados.join(", ")}</small>
              )}
              {log.valoresAnteriores && (
                <small className="log-diff">
                  Anterior: {describirValores(log.valoresAnteriores)}<br />
                  Nuevo: {describirValores(log.valoresNuevos)}
                </small>
              )}
            </article>
          ))}
        </div>
      )}
    </Modal>
  );
}
