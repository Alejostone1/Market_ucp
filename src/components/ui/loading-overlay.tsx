"use client";

import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
  show?: boolean;
}

export function LoadingOverlay({ message = "Cargando...", show = true }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-ucp-rojo animate-spin" />
            <div className="absolute inset-0 w-12 h-12 bg-ucp-rojo rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{message}</h3>
            <p className="text-sm text-gray-500">Por favor espera un momento...</p>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-ucp-rojo rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-ucp-rojo rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-ucp-rojo rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
