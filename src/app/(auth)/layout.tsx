import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-ucp-rojo rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">UCP</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">UCP Marketplace</h1>
            <p className="text-xs text-gray-500">Universidad Católica de Pereira</p>
          </div>
        </Link>
        {children}
      </div>
    </div>
  );
}
