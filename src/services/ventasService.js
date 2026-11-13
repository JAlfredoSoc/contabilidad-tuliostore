import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { obtenerFechaColombiaISO } from "../utils/dateUtils";

const usuarioActual = () => {
  if (!auth.currentUser) throw new Error("La sesión expiró. Inicia sesión nuevamente.");
  return auth.currentUser.uid;
};

export const crearIdentificadorOperacion = () => doc(collection(db, "ventas")).id;

export const suscribirVentas = (onData, onError) => {
  const ventasQuery = query(collection(db, "ventas"), orderBy("fechaRegistro", "desc"));
  return onSnapshot(ventasQuery, (snapshot) => {
    onData(snapshot.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        descripcion: data.descripcion || data.producto || "",
        valor: Number(data.valor ?? data.total ?? 0),
        metodoPago: data.metodoPago || "Efectivo",
        fechaVenta: data.fechaVenta || (
          data.fecha?.toDate ? obtenerFechaColombiaISO(data.fecha.toDate()) : obtenerFechaColombiaISO()
        ),
        observaciones: data.observaciones || "",
        estado: data.estado || (data.eliminado ? "Anulada" : "Vigente"),
        fechaRegistro: data.fechaRegistro || data.fecha || null,
        ultimaModificacion: data.ultimaModificacion || null,
        motivoAnulacion: data.motivoAnulacion || ""
      };
    }));
  }, onError);
};

export const suscribirAuditoria = (onData, onError) => {
  const auditQuery = query(collection(db, "auditoria"), orderBy("fechaServidor", "desc"));
  return onSnapshot(auditQuery, (snapshot) => {
    onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, onError);
};

const crearEvento = (ventaId, accion, valoresAnteriores, valoresNuevos, camposAfectados, motivo) => ({
  ventaId,
  accion,
  usuario: usuarioActual(),
  fechaServidor: serverTimestamp(),
  camposAfectados,
  valoresAnteriores,
  valoresNuevos,
  motivo
});

export const crearVenta = async (datos, operationId) => {
  const uid = usuarioActual();
  const ventaRef = doc(db, "ventas", operationId);
  const logRef = doc(db, "auditoria", operationId);
  const ventaExistente = await getDoc(ventaRef);
  if (ventaExistente.exists()) {
    if (ventaExistente.data().operationId === operationId) return operationId;
    throw new Error("No se pudo generar un identificador seguro para la venta. Inténtalo nuevamente.");
  }

  const batch = writeBatch(db);
  const hoy = obtenerFechaColombiaISO();
  const venta = {
    ...datos,
    operationId,
    estado: "Vigente",
    esFechaDiferida: datos.fechaVenta !== hoy,
    creadoPor: uid,
    fechaRegistro: serverTimestamp(),
    ultimaModificacion: null
  };

  batch.set(ventaRef, venta);
  batch.set(logRef, crearEvento(
    ventaRef.id,
    "CREACION",
    null,
    {
      descripcion: datos.descripcion,
      valor: datos.valor,
      metodoPago: datos.metodoPago,
      fechaVenta: datos.fechaVenta,
      observaciones: datos.observaciones
    },
    ["descripcion", "valor", "metodoPago", "fechaVenta", "observaciones"],
    datos.fechaVenta !== hoy ? `Registro con fecha de venta ${datos.fechaVenta}` : "Registro inicial"
  ));
  await batch.commit();
  return ventaRef.id;
};

export const editarVenta = async (ventaOriginal, nuevosValores, motivo) => {
  usuarioActual();
  if (ventaOriginal.estado === "Anulada") throw new Error("Una venta anulada no se puede editar.");

  const campos = ["descripcion", "valor", "metodoPago", "fechaVenta", "observaciones"];
  const camposAfectados = campos.filter(
    (campo) => (ventaOriginal[campo] ?? "") !== (nuevosValores[campo] ?? "")
  );
  const batch = writeBatch(db);
  const ventaRef = doc(db, "ventas", ventaOriginal.id);
  const logRef = doc(collection(db, "auditoria"));
  const valoresAnteriores = Object.fromEntries(
    campos.map((campo) => [campo, ventaOriginal[campo] ?? ""])
  );

  batch.update(ventaRef, {
    ...nuevosValores,
    esFechaDiferida: nuevosValores.fechaVenta !== obtenerFechaColombiaISO(),
    ultimaModificacion: serverTimestamp(),
    modificadoPor: auth.currentUser.uid
  });
  batch.set(logRef, crearEvento(
    ventaOriginal.id,
    "EDICION",
    valoresAnteriores,
    nuevosValores,
    camposAfectados.length ? camposAfectados : ["sin_cambios"],
    motivo.trim() || "Corrección de datos"
  ));
  await batch.commit();
};

export const anularVenta = async (venta) => {
  usuarioActual();
  if (venta.estado === "Anulada") throw new Error("Esta venta ya se encuentra anulada.");

  const batch = writeBatch(db);
  const ventaRef = doc(db, "ventas", venta.id);
  const logRef = doc(collection(db, "auditoria"));
  const valoresAnteriores = {
    estado: "Vigente",
    descripcion: venta.descripcion,
    valor: venta.valor,
    metodoPago: venta.metodoPago,
    fechaVenta: venta.fechaVenta,
    observaciones: venta.observaciones || ""
  };
  const valoresNuevos = { ...valoresAnteriores, estado: "Anulada" };

  batch.update(ventaRef, {
    estado: "Anulada",
    motivoAnulacion: venta.motivoAnulacion,
    fechaAnulacion: serverTimestamp(),
    anuladaPor: auth.currentUser.uid
  });
  batch.set(logRef, crearEvento(
    venta.id,
    "ANULACION",
    valoresAnteriores,
    valoresNuevos,
    ["estado"],
    venta.motivoAnulacion
  ));
  await batch.commit();
};
