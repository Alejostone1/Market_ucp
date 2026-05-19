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

    // Verificar si el usuario está bloqueado
    if (usuario.bloqueado) {
      return NextResponse.json(
        { message: "Tu cuenta ha sido bloqueada. Contacta al administrador." },
        { status: 403 }
      );
    }

    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!contrasenaValida) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Verificar si el usuario está verificado
    if (!usuario.verificado) {
      return NextResponse.json(
        { message: "Tu cuenta no está verificada. Por favor verifica tu correo electrónico." },
        { status: 403 }
      );
    }

    // Retornar datos del usuario (sin contraseña)
    const { contrasena: _, ...usuarioSinContrasena } = usuario;

    const response = NextResponse.json({
      message: "Inicio de sesión exitoso",
      usuario: usuarioSinContrasena,
    });

    // Setear cookie desde el servidor para que esté disponible en API routes
    response.cookies.set("usuario", encodeURIComponent(JSON.stringify(usuarioSinContrasena)), {
      path: "/",
      maxAge: 604800,
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { message: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
