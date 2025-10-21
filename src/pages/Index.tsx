import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Settings, FileText, Users, LogOut, Power } from "lucide-react";
import { authService } from "@/services/authService";
import logoUL from "@/assets/logo-ul.jpg";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUserFromStorage();
    if (!currentUser) {
      navigate("/auth");
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate("/auth");
  };

  const menuItems = [
    {
      title: "Panel de Control",
      description: "Control y monitoreo de sensores, LEDs, pulsadores y LCD",
      icon: Settings,
      path: "/control",
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
    },
    {
      title: "Dashboard",
      description: "Visualización de datos con gráficos y estadísticas",
      icon: BarChart3,
      path: "/dashboard",
      color: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500",
    },
    {
      title: "Reportes",
      description: "Generar reportes en PDF y Excel con filtros de fecha",
      icon: FileText,
      path: "/reports",
      color: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-500",
    },
    {
      title: "Acerca de",
      description: "Información del proyecto y equipo de desarrollo",
      icon: Users,
      path: "/about",
      color: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-500",
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <img src={logoUL} alt="Universidad Libre" className="h-16 object-contain" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Sistema de Control 
              </h1>
              <p className="text-muted-foreground mt-1">
                Bienvenido, <span className="text-primary font-semibold">{user.name}</span>
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Power className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Sistema de Control</h2>
              <p className="text-muted-foreground">ESP32 + Sensor HC-SR05 + LEDs + Pulsadores + LCD + Teclado Matricial</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 bg-background/50 rounded-lg border border-border/30">
              <p className="text-sm text-muted-foreground">Sensor</p>
              <p className="text-lg font-bold text-foreground">HC-SR05</p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border border-border/30">
              <p className="text-sm text-muted-foreground">LEDs</p>
              <p className="text-lg font-bold text-foreground">3 Unidades</p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border border-border/30">
              <p className="text-sm text-muted-foreground">Pulsadores</p>
              <p className="text-lg font-bold text-foreground">3 Botones</p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border border-border/30">
              <p className="text-sm text-muted-foreground">Display</p>
              <p className="text-lg font-bold text-foreground">LCD 16x2</p>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.path}
                className={`p-6 rounded-xl bg-gradient-to-br ${item.color} hover:shadow-lg transition-all cursor-pointer border border-border/50 block`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-background/80 rounded-xl">
                    <Icon className={`w-8 h-8 ${item.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="p-6 bg-card rounded-xl border border-border/30">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Control Bidireccional
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Control de LEDs desde la web</li>
              <li>• Visualización de pulsadores en tiempo real</li>
              <li>• Mensajes LCD sincronizados</li>
              <li>• Lectura continua del sensor</li>
            </ul>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border/30">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Base de Datos MySQL
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Almacenamiento de lecturas</li>
              <li>• Historial de estados</li>
              <li>• Reportes personalizados</li>
              <li>• Exportación PDF/Excel</li>
            </ul>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border/30">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Teclado Matricial
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Control de LEDs localmente</li>
              <li>• Control del sensor</li>
              <li>• Consulta de estados en BD</li>
              <li>• Menú interactivo en LCD</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
