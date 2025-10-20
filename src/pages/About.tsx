import { Card } from "@/components/ui/card";
import { Users, Mail, Github, Linkedin } from "lucide-react";
import logoUL from "@/assets/logo-ul.jpg";

const About = () => {
  const creators = [
    {
      name: "Creador 1",
      role: "Desarrollador Frontend",
      email: "creador1@example.com",
      github: "github.com/creador1",
      linkedin: "linkedin.com/in/creador1",
    },
    {
      name: "Creador 2",
      role: "Desarrollador Backend",
      email: "creador2@example.com",
      github: "github.com/creador2",
      linkedin: "linkedin.com/in/creador2",
    },
    {
      name: "Creador 3",
      role: "Especialista IoT",
      email: "creador3@example.com",
      github: "github.com/creador3",
      linkedin: "linkedin.com/in/creador3",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <img
            src={logoUL}
            alt="Universidad Libre"
            className="mx-auto h-32 object-contain mb-6"
          />
          <Users className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-4xl font-bold text-foreground">Acerca del Proyecto</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema de Control y Monitoreo con ESP32
          </p>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Descripción del Proyecto
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Este proyecto integra un sistema completo de Internet de las Cosas (IoT) 
              utilizando un microcontrolador ESP32, sensores, actuadores y una aplicación 
              web moderna para control y monitoreo en tiempo real.
            </p>
            <p>
              El sistema permite la interacción bidireccional entre el hardware y la 
              aplicación web, almacenando todos los datos en una base de datos MySQL 
              y proporcionando funcionalidades avanzadas como reportes, dashboard y 
              control mediante teclado matricial.
            </p>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Componentes del Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Hardware</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• ESP32 WiFi</li>
                <li>• Sensor Ultrasónico HC-SR05</li>
                <li>• 3 LEDs</li>
                <li>• 3 Pulsadores</li>
                <li>• Display LCD 16x2 I2C</li>
                <li>• Teclado Matricial 4x4</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Software</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• API REST Python/Flask</li>
                <li>• Base de Datos MySQL</li>
                <li>• Frontend React + TypeScript</li>
                <li>• Autenticación JWT</li>
                <li>• Dashboard en Tiempo Real</li>
                <li>• Generación de Reportes PDF/Excel</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground text-center">
            Equipo de Desarrollo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creators.map((creator, index) => (
              <Card key={index} className="p-6 hover-scale">
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-foreground">
                      {creator.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{creator.role}</p>
                  </div>
                  <div className="space-y-2">
                    <a
                      href={`mailto:${creator.email}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {creator.email}
                    </a>
                    <a
                      href={`https://${creator.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                    <a
                      href={`https://${creator.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <img src={logoUL} alt="UL Logo" className="h-16 object-contain" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Universidad Libre
              </h3>
              <p className="text-muted-foreground">
                Proyecto desarrollado como parte del curso de IoT y Sistemas Embebidos.
                <br />
                Todos los derechos reservados © 2025
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default About;
