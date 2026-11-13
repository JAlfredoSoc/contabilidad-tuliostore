import { useMemo } from "react";
import { Calendar } from "lucide-react";
import { generarRangoDias, obtenerFechaColombiaISO } from "../../utils/dateUtils";
import KpiGrid from "./KpiGrid";
import DailySalesChart from "./DailySalesChart";
import RecentActivity from "./RecentActivity";

const nombreMes = (fecha) => new Intl.DateTimeFormat("es-CO", {
  month: "short",
  year: "numeric",
  timeZone: "UTC"
}).format(new Date(`${fecha}T12:00:00Z`));

export default function DashboardView({ ventas, rangoInicio, rangoFin, onRangoInicio, onRangoFin }) {
  const hoy = obtenerFechaColombiaISO();
  const stats = useMemo(() => {
    const vigentes = ventas.filter((venta) => venta.estado === "Vigente");
    const ventasHoy = vigentes.filter((venta) => venta.fechaVenta === hoy);
    const ventasRango = vigentes.filter(
      (venta) => venta.fechaVenta >= rangoInicio && venta.fechaVenta <= rangoFin
    );
    const diasHastaHoy = hoy < rangoInicio ? [] : generarRangoDias(
      rangoInicio,
      hoy < rangoFin ? hoy : rangoFin
    );
    const totalHastaHoy = ventasRango
      .filter((venta) => venta.fechaVenta <= hoy)
      .reduce((total, venta) => total + venta.valor, 0);
    const mensual = new Map();
    ventasRango.forEach((venta) => {
      const mes = venta.fechaVenta.slice(0, 7);
      mensual.set(mes, (mensual.get(mes) || 0) + venta.valor);
    });
    const dias = generarRangoDias(rangoInicio, rangoFin);
    const mesesEnRango = Array.from(new Set(dias.map((fecha) => fecha.slice(0, 7))));
    const porDia = new Map();
    ventasRango.forEach((venta) => {
      porDia.set(venta.fechaVenta, (porDia.get(venta.fechaVenta) || 0) + venta.valor);
    });

    return {
      ventasHoy,
      totalHoy: ventasHoy.reduce((total, venta) => total + venta.valor, 0),
      cantidadHoy: ventasHoy.length,
      totalRango: ventasRango.reduce((total, venta) => total + venta.valor, 0),
      cantidadVigentesRango: ventasRango.length,
      promedioDiario: diasHastaHoy.length
        ? Math.round(totalHastaHoy / diasHastaHoy.length)
        : 0,
      estadoPeriodo: hoy < rangoInicio ? "no_iniciado" : "activo",
      acumuladosMensuales: mesesEnRango.map((mes) => ({
        mes,
        etiqueta: nombreMes(`${mes}-01`),
        total: mensual.get(mes) || 0
      })),
      serieGrafico: dias.map((fecha) => ({
        fecha,
        etiqueta: `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`,
        total: porDia.get(fecha) || 0
      })),
      ultimasVentas: vigentes.slice(0, 6)
    };
  }, [ventas, hoy, rangoInicio, rangoFin]);

  return (
    <>
      <section className="card range-bar">
        <div className="range-label">
          <Calendar size={16} className="icon-accent" />
          <span>Período de análisis:</span>
        </div>
        <div className="range-inputs">
          <input type="date" aria-label="Inicio del período" value={rangoInicio} onChange={(event) => onRangoInicio(event.target.value)} />
          <span>hasta</span>
          <input type="date" aria-label="Fin del período" value={rangoFin} onChange={(event) => onRangoFin(event.target.value)} />
        </div>
      </section>
      {rangoInicio > rangoFin && <div className="alert-error" role="alert">La fecha inicial debe ser anterior a la fecha final.</div>}
      <KpiGrid stats={stats} hoy={hoy} />
      <DailySalesChart data={stats.serieGrafico} inicio={rangoInicio} fin={rangoFin} />
      <RecentActivity ventasHoy={stats.ventasHoy} ultimasVentas={stats.ultimasVentas} />
    </>
  );
}
