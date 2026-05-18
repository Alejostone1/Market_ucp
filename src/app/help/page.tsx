"use client";

import { useState } from "react";
import { HelpCircle, Mail, Phone, MessageCircle, Search, ChevronDown, ChevronUp, ShoppingBag, User, Shield, CreditCard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqData = [
  {
    category: "General",
    icon: HelpCircle,
    questions: [
      {
        q: "¿Qué es UCP Marketplace?",
        a: "UCP Marketplace es la plataforma oficial de la Universidad Católica de Pereira donde estudiantes, profesores y personal pueden comprar, vender y publicar productos, servicios, eventos y oportunidades."
      },
      {
        q: "¿Es gratuito usar la plataforma?",
        a: "Sí, el uso básico de la plataforma es completamente gratuito para todos los miembros de la comunidad UCP. No hay comisiones por publicar o comprar."
      },
      {
        q: "¿Quiénes pueden usar UCP Marketplace?",
        a: "Solo miembros verificados de la Universidad Católica de Pereira (estudiantes, profesores y personal administrativo) pueden usar la plataforma."
      }
    ]
  },
  {
    category: "Compras",
    icon: ShoppingBag,
    questions: [
      {
        q: "¿Cómo compro un producto o servicio?",
        a: "Navega por el marketplace, encuentra lo que necesitas, haz clic en 'Ver más' para ver los detalles, y usa los botones de contacto para comunicarte directamente con el vendedor o agregar al carrito si es un producto físico."
      },
      {
        q: "¿Cómo funcionan los pagos?",
        a: "Los pagos se acuerdan directamente entre comprador y vendedor. La plataforma facilita el contacto pero no procesa pagos. Recomendamos usar métodos seguros como transferencias bancarias o pago en persona en lugares seguros."
      },
      {
        q: "¿Qué hago si tengo un problema con una compra?",
        a: "Contacta primero al vendedor para resolver el problema. Si no logras una solución, puedes reportar la publicación a través del botón de denuncia en la página del producto."
      }
    ]
  },
  {
    category: "Ventas",
    icon: User,
    questions: [
      {
        q: "¿Cómo publico un producto o servicio?",
        a: "Inicia sesión, ve a 'Mis Publicaciones' y haz clic en 'Crear Publicación'. Completa el formulario con título, descripción, precio, fotos y categorías. Tu publicación será revisada por el equipo administrativo antes de ser publicada."
      },
      {
        q: "¿Qué puedo publicar?",
        a: "Puedes publicar productos físicos, servicios profesionales, eventos, convocatorias, becas y cualquier otro contenido relevante para la comunidad universitaria."
      },
      {
        q: "¿Cuánto tiempo tarda en aprobar mi publicación?",
        a: "Las publicaciones suelen ser revisadas y aprobadas dentro de 24-48 horas hábiles. Recibirás una notificación cuando tu publicación sea aprobada."
      }
    ]
  },
  {
    category: "Seguridad",
    icon: Shield,
    questions: [
      {
        q: "¿Es seguro comprar en la plataforma?",
        a: "La plataforma verifica la identidad de todos los usuarios mediante correos institucionales UCP. Sin embargo, siempre recomendamos precaución: verifica al vendedor, usa métodos de pago seguros, y si es posible, realiza intercambios en lugares públicos dentro del campus."
      },
      {
        q: "¿Qué hago si encuentro una publicación sospechosa?",
        a: "Usa el botón de denuncia en la publicación para reportarla. Nuestro equipo revisará el reporte y tomará las medidas necesarias."
      },
      {
        q: "¿Mis datos personales están seguros?",
        a: "Sí, protegemos tu información según las políticas de privacidad. Solo compartimos tu correo institucional con otros usuarios cuando te comunicas directamente con ellos."
      }
    ]
  },
  {
    category: "Pagos y Entregas",
    icon: CreditCard,
    questions: [
      {
        q: "¿La plataforma procesa pagos?",
        a: "No, la plataforma no procesa pagos. Los compradores y vendedores acuerdan el método de pago directamente. Recomendamos usar transferencias bancarias para dejar registro."
      },
      {
        q: "¿Cómo se realizan las entregas?",
        a: "Las entregas se acuerdan entre comprador y vendedor. Puedes coordinar entrega en persona en el campus, envíos por servicios de mensajería, o cualquier otro método que ambos acuerden."
      },
      {
        q: "¿Qué hago si el vendedor no entrega?",
        a: "Contacta al vendedor primero. Si no recibes respuesta en un tiempo razonable, reporta la situación a través del sistema de denuncias de la plataforma."
      }
    ]
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const filteredFaq = faqData.filter(category =>
    category.questions.some(q =>
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-ucp-rojo to-red-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Centro de Ayuda</h1>
            <p className="text-lg text-white/90 mb-8">
              Encuentra respuestas a tus preguntas sobre UCP Marketplace
            </p>
            
            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Buscar en el centro de ayuda..."
                className="pl-12 pr-4 py-4 rounded-full text-gray-900 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Quick Contact */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 hover:border-ucp-rojo transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-ucp-rojo" />
                <h3 className="font-semibold mb-2">Chat en Vivo</h3>
                <p className="text-sm text-gray-600 mb-4">Chatea con nuestro equipo de soporte</p>
                <Button variant="outline" className="w-full">Iniciar Chat</Button>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-ucp-rojo transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Mail className="w-12 h-12 mx-auto mb-4 text-ucp-rojo" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-sm text-gray-600 mb-4">marketplace@ucp.edu.co</p>
                <Button variant="outline" className="w-full">Enviar Email</Button>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-ucp-rojo transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Phone className="w-12 h-12 mx-auto mb-4 text-ucp-rojo" />
                <h3 className="font-semibold mb-2">Teléfono</h3>
                <p className="text-sm text-gray-600 mb-4">+57 (6) 313 6600</p>
                <Button variant="outline" className="w-full">Llamar</Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas Frecuentes</h2>
            
            {filteredFaq.map((category) => {
              const Icon = category.icon;
              const isCategoryExpanded = expandedCategory === category.category;
              
              return (
                <Card key={category.category} className="border-2">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedCategory(isCategoryExpanded ? null : category.category)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-6 h-6 text-ucp-rojo" />
                        <CardTitle className="text-lg">{category.category}</CardTitle>
                      </div>
                      {isCategoryExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  
                  {isCategoryExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-3 mt-4">
                        {category.questions.map((item, index) => {
                          const questionId = `${category.category}-${index}`;
                          const isQuestionExpanded = expandedQuestion === questionId;
                          
                          return (
                            <div key={index} className="border rounded-lg overflow-hidden">
                              <button
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                onClick={() => setExpandedQuestion(isQuestionExpanded ? null : questionId)}
                              >
                                <span className="font-medium text-gray-900">{item.q}</span>
                                {isQuestionExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-gray-400 ml-2" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
                                )}
                              </button>
                              {isQuestionExpanded && (
                                <div className="p-4 bg-gray-50 text-gray-700">
                                  {item.a}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}

            {filteredFaq.length === 0 && (
              <Card className="border-2">
                <CardContent className="p-12 text-center">
                  <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No encontramos resultados</h3>
                  <p className="text-gray-600">Intenta con otros términos de búsqueda</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Additional Help */}
          <div className="mt-12 p-8 bg-gradient-to-r from-ucp-rojo/10 to-red-700/10 rounded-2xl border-2 border-ucp-rojo/20">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">¿No encuentras lo que buscas?</h3>
              <p className="text-gray-700 mb-6">
                Nuestro equipo de soporte está aquí para ayudarte. No dudes en contactarnos directamente.
              </p>
              <Button className="bg-ucp-rojo text-white hover:bg-red-700 rounded-full px-8">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contactar Soporte
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
