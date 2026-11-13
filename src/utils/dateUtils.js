import { ZONA_HORARIA } from "../constants/storeConfig";

export const obtenerFechaColombiaISO = (dateObj = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(dateObj);

export const formatearFechaLegible = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

export const formatearTimestampColombia = (timestamp) => {
  if (!timestamp) return "Sincronizando...";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: ZONA_HORARIA,
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
};

export const generarRangoDias = (inicioISO, finISO) => {
  if (!inicioISO || !finISO || inicioISO > finISO) return [];
  const dias = [];
  const actual = new Date(`${inicioISO}T12:00:00Z`);
  const limite = new Date(`${finISO}T12:00:00Z`);

  while (actual <= limite && dias.length < 4000) {
    dias.push(actual.toISOString().slice(0, 10));
    actual.setUTCDate(actual.getUTCDate() + 1);
  }
  return dias;
};
