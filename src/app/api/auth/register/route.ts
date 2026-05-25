import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

// ── Helpers de validación ─────────────────────────────────────────────────────

/** Solo correos que terminan en @ucp.edu.co */
const isUcpEmail = (email: string) =>
  email.toLowerCase().trim().endsWith("@ucp.edu.co");

/** Formato RFC básico de correo electrónico */
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase().trim());

// ── POST /api/auth/register ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, correo, contrasena, rol = "ESTUDIANTE" } = body;

    // ── Campos requeridos ─────────────────────────────────────────────────────
    if (!nombre?.trim() || !correo?.trim() || !contrasena) {
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

    // ── Rol válido ────────────────────────────────────────────────────────────
    const rolesValidos = ["ESTUDIANTE", "ALIADO"];
    if (!rolesValidos.includes(rol)) {
      return NextResponse.json({ message: "Rol inválido" }, { status: 400 });
    }

    // ── Formato de correo ─────────────────────────────────────────────────────
    if (!isValidEmail(correo)) {
      return NextResponse.json(
        { message: "El formato del correo electrónico no es válido" },
        { status: 400 }
      );
    }

    // ── Validación de dominio: SOLO para ESTUDIANTE ───────────────────────────
    //    Los ALIADOS pueden usar cualquier correo válido.
    if (rol === "ESTUDIANTE" && !isUcpEmail(correo)) {
      return NextResponse.json(
        {
          message:
            "Los estudiantes deben usar un correo institucional @ucp.edu.co",
        },
        { status: 400 }
      );
    }

    // ── Unicidad de correo ────────────────────────────────────────────────────
    const normalizedCorreo = correo.toLowerCase().trim();
    const existe = await prisma.usuario.findUnique({
      where: { correo: normalizedCorreo },
    });
    if (existe) {
      return NextResponse.json(
        { message: "Ya existe una cuenta con ese correo" },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(contrasena, 10);

    // ── Regla de negocio de verificación ─────────────────────────────────────
    //    ESTUDIANTE → verificado: true  (acceso inmediato al marketplace)
    //    ALIADO     → verificado: false (pendiente de aprobación del admin)
    const verificado = rol === "ESTUDIANTE";

    const usuario = await prisma.usuario.create({
      data: {
        nombre:    nombre.trim(),
        correo:    normalizedCorreo,
        contrasena: hash,
        rol,
        verificado,
      },
      select: {
        id:         true,
        nombre:     true,
        correo:     true,
        rol:        true,
        facultad:   true,
        avatarUrl:  true,
        verificado: true,
        creadoEn:   true,
      },
    });

    return NextResponse.json(
      {
        message:
          rol === "ESTUDIANTE"
            ? "Cuenta creada exitosamente"
            : "Solicitud enviada. Tu cuenta está pendiente de aprobación por el administrador.",
        usuario,
        pendienteAprobacion: rol === "ALIADO",
      },
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
