import { useEffect, useState } from "react";
import { suscribirAuditoria, suscribirVentas } from "../services/ventasService";

export default function useVentasData(autorizado) {
  const [datos, setDatos] = useState({
    usuarioId: null,
    ventas: [],
    auditoria: [],
    ventasCargadas: false,
    auditoriaCargada: false,
    cargando: false,
    error: ""
  });

  useEffect(() => {
    if (!autorizado) {
      return undefined;
    }

    const uid = autorizado.uid;
    const estadoInicial = {
      usuarioId: uid,
      ventas: [],
      auditoria: [],
      ventasCargadas: false,
      auditoriaCargada: false,
      cargando: true,
      error: ""
    };
    const reportarError = (subscriptionError) => {
      setDatos((actual) => {
        const base = actual.usuarioId === uid ? actual : estadoInicial;
        return {
          ...base,
          cargando: false,
          error: subscriptionError.message || "No se pudieron cargar los datos."
        };
      });
    };
    const unsubVentas = suscribirVentas((data) => {
      setDatos((actual) => {
        const base = actual.usuarioId === uid ? actual : estadoInicial;
        const ventasCargadas = true;
        return {
          ...base,
          ventas: data,
          ventasCargadas,
          cargando: !(ventasCargadas && base.auditoriaCargada),
          error: ""
        };
      });
    }, reportarError);
    const unsubAuditoria = suscribirAuditoria((data) => {
      setDatos((actual) => {
        const base = actual.usuarioId === uid ? actual : estadoInicial;
        const auditoriaCargada = true;
        return {
          ...base,
          auditoria: data,
          auditoriaCargada,
          cargando: !(auditoriaCargada && base.ventasCargadas),
          error: ""
        };
      });
    }, reportarError);

    return () => {
      unsubVentas();
      unsubAuditoria();
    };
  }, [autorizado]);

  const dataAutorizada = autorizado && datos.usuarioId === autorizado.uid;
  return {
    ventas: dataAutorizada ? datos.ventas : [],
    auditoria: dataAutorizada ? datos.auditoria : [],
    cargando: Boolean(autorizado) && (!dataAutorizada || datos.cargando),
    error: dataAutorizada ? datos.error : ""
  };
}
