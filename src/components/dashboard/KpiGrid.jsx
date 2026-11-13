import { Calendar, CreditCard, ShoppingBag, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { formatearFechaLegible } from "../../utils/dateUtils";
import { formatoCOP } from "../../utils/formatters";

export default function KpiGrid({ stats, hoy }) {
  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.075, delayChildren: 0.03 } }
  };
  const card = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } }
  };

  return (
    <motion.div className="kpi-grid" variants={stagger} initial="hidden" animate="visible">
      <motion.section className="card kpi-card primary-border" variants={card} whileHover={{ y: -2 }}>
        <div className="kpi-top">
          <span className="kpi-label">INGRESOS DE HOY ({formatearFechaLegible(hoy)})</span>
          <TrendingUp size={18} className="icon-accent" />
        </div>
        <div className="kpi-value">{formatoCOP(stats.totalHoy)}</div>
        <div className="kpi-footer">{stats.cantidadHoy} ventas vigentes hoy</div>
      </motion.section>
      <motion.section className="card kpi-card" variants={card} whileHover={{ y: -2 }}>
        <div className="kpi-top">
          <span className="kpi-label">ACUMULADO DEL RANGO</span>
          <ShoppingBag size={18} className="icon-accent" />
        </div>
        <div className="kpi-value money-accent">{formatoCOP(stats.totalRango)}</div>
        <div className="kpi-footer">{stats.cantidadVigentesRango} transacciones vigentes</div>
      </motion.section>
      <motion.section className="card kpi-card mini" variants={card} whileHover={{ y: -2 }}>
        <div className="kpi-top">
          <span className="kpi-label">PROMEDIO DIARIO</span>
          <CreditCard size={16} className="icon-muted" />
        </div>
        <div className="kpi-value-sm">
          {stats.estadoPeriodo === "no_iniciado" ? "Aún no iniciado" : formatoCOP(stats.promedioDiario)}
        </div>
        <span className="kpi-sub">Incluye días sin ventas transcurridos del período</span>
      </motion.section>
      <motion.section className="card kpi-card mini" variants={card} whileHover={{ y: -2 }}>
        <div className="kpi-top">
          <span className="kpi-label">ACUMULADOS MENSUALES</span>
          <Calendar size={16} className="icon-muted" />
        </div>
        <div className="meses-split">
          {stats.acumuladosMensuales.map((mes) => (
            <div key={mes.mes}>
              <small>{mes.etiqueta}</small>
              <strong>{formatoCOP(mes.total)}</strong>
            </div>
          ))}
          {!stats.acumuladosMensuales.length && <span className="muted-text">Sin meses en el rango</span>}
        </div>
      </motion.section>
    </motion.div>
  );
}
