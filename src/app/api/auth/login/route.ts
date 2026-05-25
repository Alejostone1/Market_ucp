import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { correo, contrasena } = body;

    if (!correo || !contrasena) {
      return NextResponse.json(
        { message: "Correo y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario por correo
    const usuario = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // ── Verificar bloqueo ────────────────────────────────────────────────────
    if (usuario.bloqueado) {
      const mensajeBloqueo = usuario.motivoBloqueo
        ? `Tu cuenta ha sido suspendida. Motivo: ${usuario.motivoBloqueo}. Contacta a admin@ucp.edu.co para más información.`
        : "Tu cuenta ha sido suspendida. Contacta al administrador en admin@ucp.edu.co para más información.";

      return NextResponse.json({ message: mensajeBloqueo }, { status: 403 });
    }

    // ── Verificar contraseña ────────────────────────────────────────────────
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // ── Verificar estado de verificación / aprobación ───────────────────────
    if (!usuario.verificado) {
      const message =
        usuario.rol === "ALIADO"
          ? "Tu cuenta está pendiente de aprobación por el administrador. Te notificaremos cuando sea aprobada."
          : "Tu cuenta no está verificada. Por favor verifica tu correo electrónico.";

      return NextResponse.json(
        { message, pendienteAprobacion: usuario.rol === "ALIADO" },
        { status: 403 }
      );
    }

    // ── Construir sesión (sin contraseña ni motivoBloqueo) ───────────────────
    const {
      contrasena: _pwd,
      motivoBloqueo: _motivo,
      ...usuarioSesion
    } = usuario;

    const response = NextResponse.json({
      message: "Inicio de sesión exitoso",
      usuario: usuarioSesion,
    });

    response.cookies.set(
      "usuario",
      encodeURIComponent(JSON.stringify(usuarioSesion)),
      { path: "/", maxAge: 604800, httpOnly: false, sameSite: "lax" }
    );

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { message: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
