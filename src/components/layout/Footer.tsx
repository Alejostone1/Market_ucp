import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">UCP Marketplace</h3>
            <p className="text-gray-400 text-sm">
              Plataforma exclusiva para estudiantes de la Universidad Católica de Pereira
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/explore" className="hover:text-white">Explorar</Link></li>
              <li><Link href="/dashboard/student/publications/new" className="hover:text-white">Publicar</Link></li>
              <li><a href="#" className="hover:text-white">Ayuda</a></li>
              <li><a href="#" className="hover:text-white">Términos y Condiciones</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Pereira, Risaralda</li>
              <li>soporte@ucpmarketplace.edu.co</li>
              <li>PBX: (606) 312 4000</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2026 Universidad Católica de Pereira. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
