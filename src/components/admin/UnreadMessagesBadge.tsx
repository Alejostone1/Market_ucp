"use client";

import { useEffect, useState } from "react";

/**
 * Shows unread message count in the admin sidebar.
 * Polls /api/conversaciones every 30 seconds.
 */
export function UnreadMessagesBadge() {
  const [count, setCount] = useState<number>(0);

  const fetchCount = async () => {
    try {
      const res = await fetch("/api/conversaciones", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const total = Array.isArray(data)
          ? data.reduce((sum: number, c: { unread: number }) => sum + (c.unread ?? 0), 0)
          : 0;
        setCount(total);
      }
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (count <= 0) return null;

  return (
    <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-white text-[#881a1d] shadow-sm">
      {count > 99 ? "99+" : count}
    </span>
  );
}
