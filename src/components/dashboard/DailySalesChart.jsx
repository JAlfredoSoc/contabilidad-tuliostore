import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatearFechaLegible } from "../../utils/dateUtils";
import { formatoCOP } from "../../utils/formatters";

export default function DailySalesChart({ data, inicio, fin }) {
  return (
    <section className="card">
      <div className="section-title">
        <h3>Ventas Diarias del Período ({formatearFechaLegible(inicio)} - {formatearFechaLegible(fin)})</h3>
      </div>
      {!data.length ? (
        <p className="empty">Selecciona un rango de fechas válido para visualizar el gráfico.</p>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="etiqueta" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={{ stroke: "#27272a" }} tickLine={false} />
              <YAxis
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => (value >= 1000 ? `$${value / 1000}k` : `$${value}`)}
              />
              <Tooltip
                formatter={(value) => [formatoCOP(value), "Total vendido"]}
                labelFormatter={(_label, payload) => payload?.[0]?.payload?.fecha
                  ? `Fecha: ${formatearFechaLegible(payload[0].payload.fecha)}`
                  : ""}
                contentStyle={{
                  backgroundColor: "#111318",
                  borderColor: "rgba(255,255,255,0.2)",
                  borderRadius: "12px",
                  color: "#ffffff"
                }}
                wrapperStyle={{ backdropFilter: "blur(18px)", borderRadius: "12px" }}
                cursor={{ fill: "rgba(59, 130, 246, 0.08)" }}
              />
              <Bar dataKey="total" fill="url(#salesBlue)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
