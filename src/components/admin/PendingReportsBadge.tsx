"use client";

import { useEffect, useState } from "react";

/**
 * Componente client que muestra el conteo de reportes pendientes.
 * Se refresca automáticamente cada 60 segundos.
 */
export function PendingReportsBadge() {
  const [count, setCount] = useState<number | null>(null);

  const fetchCount = async () => {
    try {
      const res = await fetch("/api/admin/reportes/stats", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCount(data.pendientes ?? 0);
      }
    } catch {
      // silencioso — no interrumpir la UI
    }
  };

  useEffect(() => {
    fetchCount();
    // Refrescar cada 60 segundos
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!count || count <= 0) return null;

  return (
    <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-white text-[#881a1d] shadow-sm">
      {count > 99 ? "99+" : count}
    </span>
  );
}
