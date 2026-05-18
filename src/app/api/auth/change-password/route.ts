import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { usuarioId, contrasenaActual, contrasenaNueva } = await request.json();

    if (!usuarioId || !contrasenaActual || !contrasenaNueva) {
      return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 });
    }

    if (contrasenaNueva.length < 6) {
      return NextResponse.json({ message: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, contrasena: true },
    });

    if (!usuario) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const valida = await bcrypt.compare(contrasenaActual, usuario.contrasena);
    if (!valida) {
      return NextResponse.json({ message: "La contraseña actual es incorrecta" }, { status: 400 });
    }

    const hash = await bcrypt.hash(contrasenaNueva, 10);
    await prisma.usuario.update({ where: { id: usuarioId }, data: { contrasena: hash } });

    return NextResponse.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
