// Re-exporta el componente de historial de moderación.
// El layout de /dashboard/admin ya provee el sidebar/header del admin,
// por lo que no necesitamos duplicar la lógica — solo reutilizamos
// el mismo componente que se usa en /admin/dashboard/historial.
export { default } from "@/app/admin/dashboard/historial/page";
