import { useState } from "react";

export default function useClipboard() {
  const [copiadoId, setCopiadoId] = useState(null);

  const copiarValor = async (id, value) => {
    await navigator.clipboard.writeText(String(value));
    setCopiadoId(id);
    window.setTimeout(() => setCopiadoId(null), 1800);
  };

  return { copiadoId, copiarValor };
}
