import { METODOS_PAGO } from "../../constants/storeConfig";
import { formatearFechaLegible } from "../../utils/dateUtils";
import { formatoCOP } from "../../utils/formatters";

export default function RecentActivity({ ventasHoy, ultimasVentas }) {
  const metodos = METODOS_PAGO.map((metodo) => {
    const registros = ventasHoy.filter((venta) => venta.metodoPago === metodo);
    return {
      metodo,
      cantidad: registros.length,
      total: registros.reduce((total, venta) => total + venta.valor, 0)
    };
  });

  return (
    <div className="charts-grid">
      <section className="card">
        <h3>Métodos de Pago (Hoy)</h3>
        <div className="metodos-list">
          {metodos.map((metodo) => (
            <div key={metodo.metodo} className="metodo-row">
              <span>{metodo.metodo} ({metodo.cantidad})</span>
              <strong>{formatoCOP(metodo.total)}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h3>Últimas Ventas Registradas</h3>
        {!ultimasVentas.length ? (
          <p className="empty">Aún no hay ventas vigentes.</p>
        ) : (
          <div className="ultimas-list">
            {ultimasVentas.map((venta) => (
              <div key={venta.id} className="ultima-item">
                <div>
                  <strong>{venta.descripcion}</strong>
                  <small>{formatearFechaLegible(venta.fechaVenta)} • {venta.metodoPago}</small>
                </div>
                <span className="money-accent">{formatoCOP(venta.valor)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
