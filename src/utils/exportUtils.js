import { formatearFechaLegible, formatearTimestampColombia } from "./dateUtils";

export const exportarVentasCSV = (ventas, inicio, fin) => {
  const vigentes = ventas.filter(
    (venta) =>
      venta.estado === "Vigente" && venta.fechaVenta >= inicio && venta.fechaVenta <= fin
  );
  if (!vigentes.length) {
    return false;
  }

  const filas = [
    ["Fecha Venta", "Descripcion", "Valor COP", "Metodo Pago", "Observaciones", "Fecha Registro Sistema"],
    ...vigentes.map((venta) => [
      formatearFechaLegible(venta.fechaVenta),
      venta.descripcion,
      venta.valor,
      venta.metodoPago,
      venta.observaciones || "",
      formatearTimestampColombia(venta.fechaRegistro)
    ])
  ];
  const escapar = (valor) => `"${String(valor ?? "").replace(/"/g, '""')}"`;
  const csv = `\uFEFF${filas.map((fila) => fila.map(escapar).join(";")).join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `TulioStore_Ventas_${inicio}_a_${fin}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  return true;
};
