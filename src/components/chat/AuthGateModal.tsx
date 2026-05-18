"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectAfterLogin?: string;
}

export function AuthGateModal({ open, onOpenChange, redirectAfterLogin }: AuthGateModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    const redirect = redirectAfterLogin ?? (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/explore");
    router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
    onOpenChange(false);
  };

  const handleRegister = () => {
    const redirect = redirectAfterLogin ?? (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/explore");
    router.push(`/register?redirect=${encodeURIComponent(redirect)}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-ucp-rojo" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold text-gray-900">
            Inicia sesión para comunicarte
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 text-base">
            Debes iniciar sesión para comunicarte con el vendedor y acceder al chat de la plataforma UCP.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          <Button
            onClick={handleLogin}
            className="w-full bg-ucp-rojo hover:bg-red-700 text-white rounded-full h-11 font-semibold"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Iniciar sesión
          </Button>
          <Button
            onClick={handleRegister}
            variant="outline"
            className="w-full border-ucp-rojo text-ucp-rojo hover:bg-red-50 rounded-full h-11 font-semibold"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Registrarse
          </Button>
          <p className="text-center text-xs text-gray-500 mt-1">
            Plataforma exclusiva para la comunidad UCP
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
