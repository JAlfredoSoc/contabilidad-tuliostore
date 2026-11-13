import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeftRight,
  Banknote,
  Check,
  CreditCard,
  PlusCircle,
  Smartphone,
  Wallet
} from "lucide-react";
import { METODOS_PAGO } from "../../constants/storeConfig";
import { obtenerFechaColombiaISO, formatearFechaLegible } from "../../utils/dateUtils";
import { formatoCOP, formatearMilesInput, limpiarNumero } from "../../utils/formatters";
import { crearIdentificadorOperacion } from "../../services/ventasService";
import Modal from "../common/Modal";

const formularioInicial = () => ({
  descripcion: "",
  valorInput: "",
  metodoPago: "Efectivo",
  fechaVenta: obtenerFechaColombiaISO(),
  observaciones: ""
});

export default function RegisterSaleView({ onSave }) {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [confirmando, setConfirmando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const bloqueo = useRef(false);
  const operationId = useRef(crearIdentificadorOperacion());
  const hoy = obtenerFechaColombiaISO();
  const actualizar = (cambios) => setFormulario((actual) => ({ ...actual, ...cambios }));
  const iconosMetodo = {
    Efectivo: Banknote,
    Nequi: Smartphone,
    Daviplata: Smartphone,
    Transferencia: ArrowLeftRight,
    Tarjeta: CreditCard
  };

  const solicitarConfirmacion = (event) => {
    event.preventDefault();
    setError("");
    if (!formulario.descripcion.trim()) {
      const message = "Por favor ingresa la descripción de los productos vendidos.";
      setError(message);
      toast.error(message);
      return;
    }
    if (limpiarNumero(formulario.valorInput) <= 0) {
      const message = "Ingresa un valor total válido mayor a $0.";
      setError(message);
      toast.error(message);
      return;
    }
    if (!formulario.fechaVenta) {
      const message = "Selecciona la fecha de realización de la venta.";
      setError(message);
      toast.error(message);
      return;
    }
    setConfirmando(true);
  };

  const guardar = async () => {
    if (bloqueo.current || procesando) return;
    bloqueo.current = true;
    setProcesando(true);
    setError("");
    try {
      await onSave({
        descripcion: formulario.descripcion.trim(),
        valor: limpiarNumero(formulario.valorInput),
        metodoPago: formulario.metodoPago,
        fechaVenta: formulario.fechaVenta,
        observaciones: formulario.observaciones.trim()
      }, operationId.current);
      setFormulario(formularioInicial());
      operationId.current = crearIdentificadorOperacion();
      setConfirmando(false);
    } catch (saveError) {
      const message = saveError.message || "Error de conexión al guardar en Firebase. Tus datos se conservan; inténtalo de nuevo.";
      setError(message);
      toast.error(message);
    } finally {
      bloqueo.current = false;
      setProcesando(false);
    }
  };

  return (
    <>
      <motion.form
        className="card form-venta"
        onSubmit={solicitarConfirmacion}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: "easeOut" }}
      >
        <div className="section-title">
          <h3>Registrar nueva venta</h3>
          <span className="badge-neutral">COP • UTC-5</span>
        </div>
        {error && <div className="alert-error" role="alert">{error}</div>}
        <label htmlFor="sale-description">Productos vendidos *</label>
        <textarea
          id="sale-description"
          rows={2}
          placeholder="Describe uno o varios productos"
          value={formulario.descripcion}
          onChange={(event) => actualizar({ descripcion: event.target.value })}
          required
        />
        <div className="row">
          <div className="form-field">
            <label htmlFor="sale-value">Valor total de la venta *</label>
            <div className="currency-field">
              <span aria-hidden="true">$</span>
              <input
                id="sale-value"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formulario.valorInput}
                onChange={(event) => actualizar({ valorInput: formatearMilesInput(event.target.value) })}
                required
              />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="sale-date">Fecha de realización *</label>
            <input
              id="sale-date"
              type="date"
              value={formulario.fechaVenta}
              onChange={(event) => actualizar({ fechaVenta: event.target.value })}
              required
            />
          </div>
        </div>
        {formulario.fechaVenta > hoy && (
          <div className="alert-warning">
            <AlertTriangle size={16} />
            <span>Advertencia: Seleccionaste una fecha posterior al día de hoy.</span>
          </div>
        )}
        <label>Método de pago *</label>
        <div className="metodos-selector" role="group" aria-label="Método de pago">
          {METODOS_PAGO.map((metodo) => {
            const Icon = iconosMetodo[metodo] || Wallet;
            return <motion.button
              type="button"
              key={metodo}
              className={`metodo-chip ${formulario.metodoPago === metodo ? "selected" : ""}`}
              onClick={() => actualizar({ metodoPago: metodo })}
              aria-pressed={formulario.metodoPago === metodo}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Icon size={18} strokeWidth={1.7} />
              {metodo}
            </motion.button>;
          })}
        </div>
        <label htmlFor="sale-notes">Observaciones (opcional)</label>
        <input
          id="sale-notes"
          type="text"
          placeholder="Notas adicionales"
          value={formulario.observaciones}
          onChange={(event) => actualizar({ observaciones: event.target.value })}
        />
        <button type="submit" className="btn-primary" disabled={procesando}>
          <PlusCircle size={18} /> Guardar venta
        </button>
      </motion.form>

      <AnimatePresence>
        {confirmando && (
        <Modal key="confirm-sale" title="Confirmar Registro de Venta" onClose={() => !procesando && setConfirmando(false)}>
          <div className="resumen-box">
            <p><span>Productos:</span><strong>{formulario.descripcion}</strong></p>
            <p><span>Valor total:</span><strong className="money-accent">{formatoCOP(limpiarNumero(formulario.valorInput))}</strong></p>
            <p><span>Método de pago:</span><strong>{formulario.metodoPago}</strong></p>
            <p><span>Fecha de venta:</span><strong>{formatearFechaLegible(formulario.fechaVenta)}</strong></p>
            {formulario.observaciones && <p><span>Observaciones:</span><strong>{formulario.observaciones}</strong></p>}
          </div>
          {error && <div className="alert-error modal-alert" role="alert">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setConfirmando(false)} disabled={procesando}>
              Corregir
            </button>
            <button type="button" className="btn-primary" onClick={guardar} disabled={procesando}>
              <Check size={18} /> {procesando ? "Guardando..." : "Confirmar y guardar"}
            </button>
          </div>
        </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
