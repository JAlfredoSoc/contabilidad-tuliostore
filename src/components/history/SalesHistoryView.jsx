import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Search, X } from "lucide-react";
import { toast } from "sonner";
import { METODOS_PAGO } from "../../constants/storeConfig";
import { obtenerFechaColombiaISO } from "../../utils/dateUtils";
import { formatoCOP } from "../../utils/formatters";
import useClipboard from "../../hooks/useClipboard";
import AuditLogModal from "../audit/AuditLogModal";
import SaleDetailModal from "../audit/SaleDetailModal";
import EditSaleModal from "./EditSaleModal";
import SaleItemCard from "./SaleItemCard";
import VoidSaleModal from "./VoidSaleModal";

export default function SalesHistoryView({ ventas, auditoria, onEdit, onVoid }) {
  const [fecha, setFecha] = useState("");
  const hoy = obtenerFechaColombiaISO();
  const [busqueda, setBusqueda] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("Todos");
  const [detalle, setDetalle] = useState(null);
  const [editando, setEditando] = useState(null);
  const [anulando, setAnulando] = useState(null);
  const [auditoriaVentaId, setAuditoriaVentaId] = useState(null);
  const { copiadoId, copiarValor } = useClipboard();

  const ventasFiltradas = useMemo(() => ventas
    .filter((venta) => {
      const coincideFecha = Boolean(busqueda.trim()) || !fecha || venta.fechaVenta === fecha;
      const coincideTexto = !busqueda.trim()
        || venta.descripcion.toLocaleLowerCase("es-CO").includes(busqueda.trim().toLocaleLowerCase("es-CO"));
      const coincideMetodo = filtroMetodo === "Todos" || venta.metodoPago === filtroMetodo;
      return coincideFecha && coincideTexto && coincideMetodo;
    })
    .sort((a, b) => {
      if (a.fechaVenta !== b.fechaVenta) return b.fechaVenta.localeCompare(a.fechaVenta);
      const tiempoA = a.fechaRegistro?.toMillis ? a.fechaRegistro.toMillis() : 0;
      const tiempoB = b.fechaRegistro?.toMillis ? b.fechaRegistro.toMillis() : 0;
      return tiempoB - tiempoA;
    }), [ventas, busqueda, fecha, filtroMetodo]);

  const resumenDia = useMemo(() => ventas
    .filter((venta) => (!fecha || venta.fechaVenta === fecha) && venta.estado === "Vigente")
    .reduce((resumen, venta) => ({
      total: resumen.total + venta.valor,
      cantidad: resumen.cantidad + 1
    }), { total: 0, cantidad: 0 }), [ventas, fecha]);

  const copiar = async (venta) => {
    try {
      await copiarValor(venta.id, venta.valor);
      toast.info("Valor copiado");
    } catch {
      toast.error("No fue posible copiar el valor. Verifica los permisos del navegador.");
    }
  };

  return (
    <>
      <section className="card">
        <div className="lista-header">
          <div>
            <h3>Historial de ventas</h3>
            <small className="muted-text">
              {resumenDia.cantidad} transacciones vigentes • {fecha ? "Total del día:" : "Total de ventas:"}{" "}
              <strong className="money-accent">{formatoCOP(resumenDia.total)}</strong>
            </small>
          </div>
          <div className="fecha-picker">
            <Calendar size={16} className="icon-accent" />
            <div className="date-filter-shortcuts" role="group" aria-label="Atajos de fecha">
              <button
                type="button"
                className={`date-filter-chip ${!fecha ? "active" : ""}`}
                aria-pressed={!fecha}
                onClick={() => {
                  setFecha("");
                  setBusqueda("");
                }}
              >
                Todas
              </button>
              <button
                type="button"
                className={`date-filter-chip ${fecha === hoy ? "active" : ""}`}
                aria-pressed={fecha === hoy}
                onClick={() => {
                  setFecha(hoy);
                  setBusqueda("");
                }}
              >
                Hoy
              </button>
            </div>
            <input
              type="date"
              aria-label="Filtrar historial por fecha"
              value={fecha}
              onChange={(event) => {
                setFecha(event.target.value);
                setBusqueda("");
              }}
            />
          </div>
        </div>
        <div className="filtros-bar">
          <div className="search-box">
            <Search size={16} className="icon-muted" />
            <input
              type="search"
              placeholder="Buscar por descripción del producto..."
              aria-label="Buscar ventas por descripción"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
            {busqueda && (
              <button type="button" className="btn-icon" aria-label="Limpiar búsqueda" onClick={() => setBusqueda("")}>
                <X size={14} />
              </button>
            )}
          </div>
          <select aria-label="Filtrar por método de pago" value={filtroMetodo} onChange={(event) => setFiltroMetodo(event.target.value)}>
            <option value="Todos">Todos los métodos</option>
            {METODOS_PAGO.map((metodo) => <option key={metodo} value={metodo}>{metodo}</option>)}
          </select>
        </div>
        {!ventasFiltradas.length ? (
          <p className="empty">
            {busqueda.trim() || filtroMetodo !== "Todos"
              ? "No hay ventas registradas para los criterios seleccionados."
              : "No hay ventas registradas en la fecha seleccionada."}
          </p>
        ) : (
          <motion.div
            className="lista-ventas"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.045 } } }}
          >
            <AnimatePresence mode="popLayout">
            {ventasFiltradas.map((venta) => (
              <SaleItemCard
                key={venta.id}
                venta={venta}
                copiado={copiadoId === venta.id}
                onCopy={() => copiar(venta)}
                onDetails={() => setDetalle(venta)}
                onAudit={() => setAuditoriaVentaId(venta.id)}
                onEdit={() => setEditando(venta)}
                onVoid={() => setAnulando(venta)}
              />
            ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
      <AnimatePresence>
        {detalle && <SaleDetailModal key={`detail-${detalle.id}`} venta={detalle} onClose={() => setDetalle(null)} />}
      </AnimatePresence>
      <AnimatePresence>
      {auditoriaVentaId && (
        <AuditLogModal auditoria={auditoria} ventaId={auditoriaVentaId} onClose={() => setAuditoriaVentaId(null)} />
      )}
      </AnimatePresence>
      <AnimatePresence>
      {editando && (
        <EditSaleModal
          venta={editando}
          onClose={() => setEditando(null)}
          onSave={async (...args) => {
            await onEdit(...args);
            setEditando(null);
          }}
        />
      )}
      </AnimatePresence>
      <AnimatePresence>
      {anulando && (
        <VoidSaleModal
          venta={anulando}
          onClose={() => setAnulando(null)}
          onVoid={async (venta) => {
            await onVoid(venta);
            setAnulando(null);
          }}
        />
      )}
      </AnimatePresence>
    </>
  );
}
