import { formatearFechaLegible, formatearTimestampColombia } from "../../utils/dateUtils";
import { formatoCOP } from "../../utils/formatters";
import Modal from "../common/Modal";

export default function SaleDetailModal({ venta, onClose }) {
  if (!venta) return null;
  return (
    <Modal title="Detalle de Transacción" onClose={onClose}>
      <div className="resumen-box">
        <p><span>ID único:</span><code>{venta.id}</code></p>
        <p><span>Estado:</span><strong>{venta.estado}</strong></p>
        <p><span>Productos:</span><strong>{venta.descripcion}</strong></p>
        <p><span>Valor total:</span><strong className="money-accent">{formatoCOP(venta.valor)}</strong></p>
        <p><span>Método de pago:</span><strong>{venta.metodoPago}</strong></p>
        <p><span>Fecha de venta:</span><strong>{formatearFechaLegible(venta.fechaVenta)}</strong></p>
        <p><span>Ingresada al sistema:</span><strong>{formatearTimestampColombia(venta.fechaRegistro)}</strong></p>
        <p><span>Observaciones:</span><strong>{venta.observaciones || "Ninguna"}</strong></p>
        {venta.motivoAnulacion && (
          <p><span>Motivo anulación:</span><strong className="danger-text">{venta.motivoAnulacion}</strong></p>
        )}
      </div>
    </Modal>
  );
}
