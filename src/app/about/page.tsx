"use client";

import { useState, useEffect } from "react";
import { Code, Users, Target, Zap, Award, Heart, Github, Linkedin, Mail, ArrowRight, CheckCircle, TrendingUp, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const team = [
  {
    name: "Alejandro Piedrahita",
    role: "Desarrollador Full Stack",
    image: "/team/alejandro.jpg",
    description: "Especialista en desarrollo frontend y experiencia de usuario. Apasionado por crear interfaces intuitivas y accesibles.",
    skills: ["React", "Next.js", "TypeScript", "UI/UX"],
    github: "#",
    linkedin: "#",
    email: "alejandro@ucp.edu.co"
  },
  {
    name: "Daniel Colorado",
    role: "Desarrollador Backend",
    image: "/team/daniel.jpg",
    description: "Experto en arquitectura de sistemas y bases de datos. Enfocado en el rendimiento y seguridad de la plataforma.",
    skills: ["Node.js", "PostgreSQL", "API REST", "DevOps"],
    github: "#",
    linkedin: "#",
    email: "daniel@ucp.edu.co"
  },
  {
    name: "Sebastian Patiño",
    role: "Desarrollador Full Stack",
    image: "/team/sebastian.jpg",
    description: "Especialista en integración de sistemas y optimización de procesos. Apasionado por la innovación tecnológica.",
    skills: ["React", "Python", "Cloud Services", "Testing"],
    github: "#",
    linkedin: "#",
    email: "sebastian@ucp.edu.co"
  }
];

const features = [
  {
    icon: Users,
    title: "Comunidad Universitaria",
    description: "Conecta estudiantes, profesores y personal en un ecosistema seguro y verificado."
  },
  {
    icon: Shield,
    title: "Seguridad Garantizada",
    description: "Verificación de identidad mediante correos institucionales y moderación activa."
  },
  {
    icon: Zap,
    title: "Experiencia Fluida",
    description: "Interfaz intuitiva diseñada pensando en la facilidad de uso para todos."
  },
  {
    icon: Clock,
    title: "Disponible 24/7",
    description: "Accede a la plataforma en cualquier momento desde cualquier dispositivo."
  },
  {
    icon: TrendingUp,
    title: "Escalable",
    description: "Arquitectura preparada para crecer con la comunidad universitaria."
  },
  {
    icon: Award,
    title: "Calidad Asegurada",
    description: "Código de alta calidad con mejores prácticas y pruebas exhaustivas."
  }
];

const stats = [
  { value: "3", label: "Desarrolladores" },
  { value: "100%", label: "Dedicación" },
  { value: "6", label: "Meses de Desarrollo" },
  { value: "1", label: "Proyecto Visionario" }
];

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-ucp-rojo text-white">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Code className="w-5 h-5" />
                <span className="text-sm font-medium">Proyecto de Ingeniería de Software</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                UCP Marketplace
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Una plataforma innovadora que transforma la manera en que la comunidad universitaria compra, vende y comparte productos y servicios.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 py-6 text-lg">
                  Explorar Marketplace
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg">
                  Conocer al Equipo
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-ucp-rojo/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`text-center transition-all duration-700 delay-${index * 100} ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="text-4xl md:text-5xl font-bold text-ucp-rojo mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Project */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Sobre el Proyecto</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                UCP Marketplace nace como proyecto final de la asignatura de Ingeniería de Software en la Universidad Católica de Pereira. Nuestra visión es crear un ecosistema digital que facilite el intercambio de bienes y servicios dentro de la comunidad universitaria.
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Desarrollamos esta plataforma con las mejores prácticas de ingeniería de software, enfocándonos en la escalabilidad, seguridad y experiencia del usuario. Cada línea de código fue pensada para ofrecer una solución robusta y confiable.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-ucp-rojo" />
                  <span className="text-gray-700">Arquitectura moderna con Next.js 14</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-ucp-rojo" />
                  <span className="text-gray-700">Base de datos PostgreSQL con Prisma ORM</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-ucp-rojo" />
                  <span className="text-gray-700">Diseño responsive y accesible</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-ucp-rojo" />
                  <span className="text-gray-700">Sistema de autenticación seguro</span>
                </div>
              </div>
            </div>
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative">
                <div className="bg-gradient-to-br from-ucp-rojo/10 to-red-700/10 rounded-3xl p-8 border-2 border-ucp-rojo/20">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                      <Code className="w-10 h-10 text-ucp-rojo mb-4" />
                      <h3 className="font-bold text-gray-900 mb-2">Frontend</h3>
                      <p className="text-sm text-gray-600">React, Next.js, TailwindCSS</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                      <Target className="w-10 h-10 text-ucp-rojo mb-4" />
                      <h3 className="font-bold text-gray-900 mb-2">Backend</h3>
                      <p className="text-sm text-gray-600">Node.js, API Routes</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                      <Users className="w-10 h-10 text-ucp-rojo mb-4" />
                      <h3 className="font-bold text-gray-900 mb-2">Database</h3>
                      <p className="text-sm text-gray-600">PostgreSQL, Prisma</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                      <Shield className="w-10 h-10 text-ucp-rojo mb-4" />
                      <h3 className="font-bold text-gray-900 mb-2">Security</h3>
                      <p className="text-sm text-gray-600">JWT, NextAuth</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-ucp-rojo/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Características Principales</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Diseñamos cada función pensando en la experiencia del usuario y las necesidades de la comunidad.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = activeFeature === index;
                
                return (
                  <Card 
                    key={index}
                    className={`border-2 transition-all duration-300 ${
                      isActive ? 'border-ucp-rojo shadow-lg scale-105' : 'border-gray-200 hover:border-ucp-rojo/50'
                    }`}
                  >
                    <CardContent className="p-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                        isActive ? 'bg-ucp-rojo' : 'bg-ucp-rojo/10'
                      }`}>
                        <Icon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-ucp-rojo'}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestro Equipo</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Conoce a los desarrolladores que hicieron posible este proyecto.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card 
                  key={index}
                  className="border-2 hover:border-ucp-rojo transition-all duration-300 hover:shadow-xl group"
                >
                  <CardContent className="p-8 text-center">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-ucp-rojo to-red-700 flex items-center justify-center text-white text-4xl font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-ucp-rojo font-medium mb-4">{member.role}</p>
                    <p className="text-gray-600 mb-6 leading-relaxed">{member.description}</p>
                    
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {member.skills.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex}
                          className="px-3 py-1 bg-ucp-rojo/10 text-ucp-rojo rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <a 
                        href={member.github}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-ucp-rojo hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                      <a 
                        href={member.linkedin}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-ucp-rojo hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                      <a 
                        href={`mailto:${member.email}`}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-ucp-rojo hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-ucp-rojo to-red-700 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Heart className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">¿Listo para comenzar?</h2>
            <p className="text-xl text-white/90 mb-8">
              Únete a nuestra comunidad universitaria y descubre todo lo que UCP Marketplace tiene para ofrecerte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-ucp-rojo hover:bg-gray-100 rounded-full px-8 py-6 text-lg">
                Registrarse Ahora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg">
                Explorar Marketplace
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-400 mb-4">
              © 2024 UCP Marketplace. Proyecto de Ingeniería de Software.
            </p>
            <p className="text-gray-500 text-sm">
              Universidad Católica de Pereira
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
