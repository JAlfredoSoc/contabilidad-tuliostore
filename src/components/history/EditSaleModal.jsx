import { useState } from "react";
import { toast } from "sonner";
import { METODOS_PAGO } from "../../constants/storeConfig";
import { formatearFechaLegible } from "../../utils/dateUtils";
import { formatoCOP, formatearMilesInput, limpiarNumero } from "../../utils/formatters";
import Modal from "../common/Modal";

export default function EditSaleModal({ venta, onClose, onSave }) {
  const [descripcion, setDescripcion] = useState(venta.descripcion);
  const [valorInput, setValorInput] = useState(formatearMilesInput(venta.valor));
  const [metodoPago, setMetodoPago] = useState(venta.metodoPago);
  const [fechaVenta, setFechaVenta] = useState(venta.fechaVenta);
  const [observaciones, setObservaciones] = useState(venta.observaciones || "");
  const [motivo, setMotivo] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const confirmarEdicion = async () => {
    if (procesando) return;
    const valor = limpiarNumero(valorInput);
    if (!descripcion.trim() || valor <= 0 || !fechaVenta) {
      const message = "Completa la descripción, un valor mayor a $0 y la fecha de venta.";
      setError(message);
      toast.error(message);
      setConfirmando(false);
      return;
    }
    setProcesando(true);
    setError("");
    try {
      await onSave(venta, {
        descripcion: descripcion.trim(),
        valor,
        metodoPago,
        fechaVenta,
        observaciones: observaciones.trim()
      }, motivo);
    } catch (saveError) {
      const message = saveError.message || "No se pudo guardar la edición. Inténtalo nuevamente.";
      setError(message);
      toast.error(message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Modal title="Editar Venta" onClose={() => !procesando && onClose()} wide>
      <div className="form-venta">
        <label htmlFor="edit-description">Descripción de productos</label>
        <textarea id="edit-description" rows={2} value={descripcion} onChange={(event) => setDescripcion(event.target.value)} />
        <div className="row">
          <div className="form-field">
            <label htmlFor="edit-value">Valor total</label>
            <div className="currency-field">
              <span aria-hidden="true">$</span>
              <input id="edit-value" type="text" inputMode="numeric" value={valorInput} onChange={(event) => setValorInput(formatearMilesInput(event.target.value))} />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="edit-date">Fecha de venta</label>
            <input id="edit-date" type="date" value={fechaVenta} onChange={(event) => setFechaVenta(event.target.value)} />
          </div>
        </div>
        <label htmlFor="edit-method">Método de pago</label>
        <select id="edit-method" value={metodoPago} onChange={(event) => setMetodoPago(event.target.value)}>
          {METODOS_PAGO.map((metodo) => <option key={metodo} value={metodo}>{metodo}</option>)}
        </select>
        <label htmlFor="edit-notes">Observaciones</label>
        <input id="edit-notes" type="text" value={observaciones} onChange={(event) => setObservaciones(event.target.value)} />
        <label htmlFor="edit-reason">Motivo de la modificación (opcional)</label>
        <input id="edit-reason" type="text" placeholder="Ej. Corrección del valor" value={motivo} onChange={(event) => setMotivo(event.target.value)} />
        {!confirmando ? (
          <button type="button" className="btn-primary" onClick={() => {
            setError("");
            if (!descripcion.trim() || limpiarNumero(valorInput) <= 0 || !fechaVenta) {
              const message = "Completa la descripción, un valor mayor a $0 y la fecha de venta.";
              setError(message);
              toast.error(message);
              return;
            }
            setConfirmando(true);
          }}>
            Continuar y confirmar
          </button>
        ) : (
          <div className="confirm-box">
            <p>¿Confirmas aplicar esta modificación al registro contable?</p>
            <div className="resumen-box">
              <p><span>Productos:</span><strong>{descripcion}</strong></p>
              <p><span>Valor:</span><strong>{formatoCOP(limpiarNumero(valorInput))}</strong></p>
              <p><span>Método:</span><strong>{metodoPago}</strong></p>
              <p><span>Fecha:</span><strong>{formatearFechaLegible(fechaVenta)}</strong></p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setConfirmando(false)} disabled={procesando}>Volver</button>
              <button type="button" className="btn-primary" onClick={confirmarEdicion} disabled={procesando}>
                {procesando ? "Actualizando..." : "Sí, guardar cambios"}
              </button>
            </div>
          </div>
        )}
        {error && <div className="alert-error" role="alert">{error}</div>}
      </div>
    </Modal>
  );
}
