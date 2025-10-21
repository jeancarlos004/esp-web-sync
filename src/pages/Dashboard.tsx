import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Activity, Lightbulb, Ruler, TrendingUp } from "lucide-react";
import { dashboardService, DashboardStats } from "@/services/dashboardService";
import { sensorService, SensorReading } from "@/services/sensorService";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))'];

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // Actualizar cada 10s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, readingsData] = await Promise.all([
        dashboardService.getStats(),
        sensorService.getHistory(20),
      ]);
      setStats(statsData);
      setReadings(readingsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const ledData = [
    { name: 'Encendidos', value: stats?.ledOnCount || 0 },
    { name: 'Apagados', value: stats?.ledOffCount || 0 },
  ];

  const distanceData = readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString(),
    distancia: parseFloat(r.distance.toString()),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground">Dashboard </h1>
          <Activity className="w-8 h-8 text-primary" />
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover-scale">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Lecturas</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalReadings || 0}</p>
              </div>
              <Activity className="w-12 h-12 text-primary opacity-20" />
            </div>
          </Card>

          <Card className="p-6 hover-scale">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Distancia Promedio</p>
                <p className="text-3xl font-bold text-foreground">{stats?.averageDistance?.toFixed(1) || 0} cm</p>
              </div>
              <Ruler className="w-12 h-12 text-primary opacity-20" />
            </div>
          </Card>

          <Card className="p-6 hover-scale">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">LEDs Encendidos</p>
                <p className="text-3xl font-bold text-foreground">{stats?.ledOnCount || 0}</p>
              </div>
              <Lightbulb className="w-12 h-12 text-primary opacity-20" />
            </div>
          </Card>

          <Card className="p-6 hover-scale">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pulsaciones</p>
                <p className="text-3xl font-bold text-foreground">{stats?.buttonPresses || 0}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-primary opacity-20" />
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Historial de Distancia</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={distanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="distancia" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Estado de LEDs</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ledData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {ledData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Rango de Distancias</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Mínima', valor: stats?.minDistance || 0 },
                { name: 'Promedio', valor: stats?.averageDistance || 0 },
                { name: 'Máxima', valor: stats?.maxDistance || 0 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
