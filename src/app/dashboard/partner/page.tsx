"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PartnerRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard/student"); }, [router]);
  return null;
}
