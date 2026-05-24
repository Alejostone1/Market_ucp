"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Redirige a la página unificada de favoritos */
export default function FavoritesDashboardRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/favorites"); }, [router]);
  return null;
}
