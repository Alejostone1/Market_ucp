"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ContactButtonProps {
  vendorId: string;
  vendorName?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
  showIcon?: boolean;
}

export function ContactButton({
  vendorId,
  vendorName,
  variant = "outline",
  size = "default",
  className = "",
  label = "Contactar",
  showIcon = true,
}: ContactButtonProps) {
  const { usuario, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Don't show the button while auth is initializing
  if (isLoading) return null;

  // Don't allow contacting yourself
  if (isAuthenticated && usuario?.id === vendorId) return null;

  const handleClick = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/conversaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: vendorId }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Error al iniciar conversación");
        return;
      }

      const data = await res.json();
      // Route to the correct messages page based on the current user's role
      const messagesPath =
        usuario?.rol === "ADMIN"
          ? `/admin/dashboard/messages?c=${data.id}`
          : `/dashboard/student/messages?c=${data.id}`;
      router.push(messagesPath);
    } catch {
      toast.error("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`rounded-full border-ucp-rojo text-ucp-rojo hover:bg-red-50 ${className}`}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : showIcon ? (
          <MessageCircle className="w-4 h-4 mr-2" />
        ) : null}
        {label}
      </Button>

    </>
  );
}
