import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, correo, contrasena, rol = "ESTUDIANTE" } = body;

    if (!nombre || !correo || !contrasena) {
      return NextResponse.json(
        { message: "Nombre, correo y contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (contrasena.length < 6) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const rolesValidos = ["ESTUDIANTE", "ALIADO"];
    if (!rolesValidos.includes(rol)) {
      return NextResponse.json({ message: "Rol inválido" }, { status: 400 });
    }

    const existe = await prisma.usuario.findUnique({ where: { correo } });
    if (existe) {
      return NextResponse.json(
        { message: "Ya existe una cuenta con ese correo" },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        correo,
        contrasena: hash,
        rol,
        verificado: true,
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        facultad: true,
        avatarUrl: true,
        verificado: true,
        creadoEn: true,
      },
    });

    return NextResponse.json(
      { message: "Cuenta creada exitosamente", usuario },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { message: "Error al crear la cuenta" },
      { status: 500 }
    );
  }
}
