export const formatoCOP = (valor) =>
  `$${Math.round(Number(valor || 0)).toLocaleString("es-CO")}`;

export const formatearMilesInput = (valor) => {
  const soloNumeros = String(valor).replace(/\D/g, "");
  if (!soloNumeros) return "";
  return Number(soloNumeros).toLocaleString("es-CO");
};

export const limpiarNumero = (valorFormateado) => {
  const numero = Number(String(valorFormateado).replace(/\D/g, ""));
  return Number.isSafeInteger(numero) && numero > 0 ? numero : 0;
};
