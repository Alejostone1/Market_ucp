"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Settings, Lock, User } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { usuario, updateUsuario } = useAuth();

  const [profileForm, setProfileForm] = useState({
    nombre:   usuario?.nombre   ?? "",
    telefono: usuario?.telefono ?? "",
    facultad: usuario?.facultad ?? "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    actual:    "",
    nueva:     "",
    confirmar: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // ── Guardar datos del perfil ─────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!usuario?.id) return;
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/usuarios/${usuario.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          nombre:   profileForm.nombre.trim()   || undefined,
          telefono: profileForm.telefono.trim() || null,
          facultad: profileForm.facultad.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();

      // Sincronizar AuthContext con los nuevos datos
      updateUsuario({
        nombre:   profileForm.nombre.trim()   || usuario.nombre,
        telefono: profileForm.telefono.trim() || null,
        facultad: profileForm.facultad.trim() || null,
      });

      toast.success("Perfil actualizado correctamente");
    } catch {
      toast.error("Error al actualizar el perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Cambiar contraseña ────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (passwordForm.nueva !== passwordForm.confirmar) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }
    if (passwordForm.nueva.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          usuarioId:       usuario?.id,
          contrasenaActual: passwordForm.actual,
          contrasenaNueva:  passwordForm.nueva,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Contraseña actualizada correctamente");
      setPasswordForm({ actual: "", nueva: "", confirmar: "" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al cambiar la contraseña");
    } finally {
      setSavingPassword(false);
    }
  };

  if (!usuario) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-7 h-7 text-ucp-rojo" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500 text-sm">Administra tu cuenta y perfil</p>
        </div>
      </div>

      <div className="space-y-6 max-w-lg">

        {/* ── Foto de perfil ─────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-md rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-ucp-rojo" />
              <h2 className="text-lg font-semibold text-gray-900">Foto de perfil</h2>
            </div>

            <div className="flex justify-center">
              <AvatarUpload
                currentUrl={usuario.avatarUrl}
                name={usuario.nombre}
                usuarioId={usuario.id}
                size="lg"
                onSuccess={(newUrl) => {
                  // Actualizar AuthContext para que el avatar se propague a todo el app
                  updateUsuario({ avatarUrl: newUrl || null });
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Datos personales ───────────────────────────────────────────────── */}
        <Card className="border-0 shadow-md rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-ucp-rojo" />
              <h2 className="text-lg font-semibold text-gray-900">Datos personales</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Nombre completo</Label>
                <Input
                  value={profileForm.nombre}
                  onChange={(e) => setProfileForm({ ...profileForm, nombre: e.target.value })}
                  className="rounded-full mt-1"
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={profileForm.telefono}
                  onChange={(e) => setProfileForm({ ...profileForm, telefono: e.target.value })}
                  placeholder="+57 300 000 0000"
                  className="rounded-full mt-1"
                />
              </div>
              <div>
                <Label>Facultad / Programa</Label>
                <Input
                  value={profileForm.facultad}
                  onChange={(e) => setProfileForm({ ...profileForm, facultad: e.target.value })}
                  placeholder="Ej: Ingeniería de Sistemas"
                  className="rounded-full mt-1"
                />
              </div>
              <div>
                <Label>Correo electrónico</Label>
                <Input
                  value={usuario.correo}
                  disabled
                  className="rounded-full mt-1 bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">El correo no se puede cambiar.</p>
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full bg-ucp-rojo hover:bg-red-700 text-white rounded-full"
              >
                {savingProfile ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Cambio de contraseña ───────────────────────────────────────────── */}
        <Card className="border-0 shadow-md rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-ucp-rojo" />
              <h2 className="text-lg font-semibold text-gray-900">Cambiar contraseña</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Contraseña actual</Label>
                <Input
                  type="password"
                  value={passwordForm.actual}
                  onChange={(e) => setPasswordForm({ ...passwordForm, actual: e.target.value })}
                  className="rounded-full mt-1"
                />
              </div>
              <div>
                <Label>Nueva contraseña</Label>
                <Input
                  type="password"
                  value={passwordForm.nueva}
                  onChange={(e) => setPasswordForm({ ...passwordForm, nueva: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="rounded-full mt-1"
                />
              </div>
              <div>
                <Label>Confirmar nueva contraseña</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmar}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmar: e.target.value })}
                  className="rounded-full mt-1"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="w-full bg-ucp-rojo hover:bg-red-700 text-white rounded-full"
              >
                {savingPassword ? "Cambiando..." : "Cambiar contraseña"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
