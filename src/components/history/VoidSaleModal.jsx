import { useState } from "react";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { formatoCOP } from "../../utils/formatters";
import Modal from "../common/Modal";

export default function VoidSaleModal({ venta, onClose, onVoid }) {
  const [motivo, setMotivo] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const anular = async () => {
    if (procesando) return;
    if (!motivo.trim()) {
      const message = "Debes ingresar un motivo obligatorio para anular la venta.";
      setError(message);
      toast.error(message);
      return;
    }
    setProcesando(true);
    setError("");
    try {
      await onVoid({ ...venta, motivoAnulacion: motivo.trim() });
    } catch (voidError) {
      const message = voidError.message || "No se pudo anular la venta. Inténtalo nuevamente.";
      setError(message);
      toast.error(message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Modal title="Anular Venta" onClose={() => !procesando && onClose()}>
      <p className="muted-text modal-copy">
        La venta <strong>"{venta.descripcion}"</strong> por <strong>{formatoCOP(venta.valor)}</strong> cambiará a estado
        <span className="badge badge-anulada">Anulada</span> y dejará de sumar en los totales, conservándose en la base de datos.
      </p>
      <div className="form-venta">
        <label htmlFor="void-reason">Motivo de anulación (obligatorio) *</label>
        <textarea
          id="void-reason"
          rows={2}
          placeholder="Explica por qué se anula esta venta..."
          value={motivo}
          onChange={(event) => setMotivo(event.target.value)}
          required
        />
        {confirmando ? (
          <div className="confirm-box">
            <p>¿Confirmas anular esta venta? Esta acción no se puede deshacer desde la aplicación.</p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setConfirmando(false)} disabled={procesando}>Volver</button>
              <button type="button" className="btn-danger" onClick={anular} disabled={procesando || !motivo.trim()}>
                <Ban size={16} /> {procesando ? "Anulando..." : "Confirmar anulación"}
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={procesando}>Cancelar</button>
            <button type="button" className="btn-danger" onClick={() => {
              if (!motivo.trim()) {
                const message = "Debes ingresar un motivo obligatorio para anular la venta.";
                setError(message);
                toast.error(message);
                return;
              }
              setError("");
              setConfirmando(true);
            }}>
              <Ban size={16} /> Continuar
            </button>
          </div>
        )}
        {error && <div className="alert-error" role="alert">{error}</div>}
      </div>
    </Modal>
  );
}
