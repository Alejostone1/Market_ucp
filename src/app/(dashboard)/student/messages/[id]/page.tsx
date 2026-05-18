"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// This page handles two URL patterns that reach here:
// 1. /messages/{userId}  — old links that pass the seller's user ID
// 2. /messages/{convId}  — direct conversation ID links
//
// In both cases we resolve to /messages?c={conversationId}
export default function MessageRedirectPage() {
  const { id } = useParams<{ id: string }>();
  const { usuario, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(`/dashboard/student/messages/${id}`)}`);
      return;
    }

    // Try to find-or-create a conversation treating `id` as a user ID
    const resolve = async () => {
      const res = await fetch("/api/conversaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: id }),
      });

      if (res.ok) {
        const data = await res.json();
        router.replace(`/dashboard/student/messages?c=${data.id}`);
        return;
      }

      // If POST failed (e.g. id is already a conversation ID, not a user ID),
      // go directly to the messages page with the id as the conversation
      router.replace(`/dashboard/student/messages?c=${id}`);
    };

    resolve().catch(() => {
      router.replace("/dashboard/student/messages");
    });
  }, [isLoading, isAuthenticated, id, router]);

  return (
    <div className="flex items-center justify-center h-[60vh] gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-ucp-rojo" />
      <span className="text-gray-500 text-sm">Abriendo conversación…</span>
    </div>
  );
}
