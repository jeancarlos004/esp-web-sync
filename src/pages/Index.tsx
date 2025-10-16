import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SensorCard from "@/components/SensorCard";
import SensorHistory from "@/components/SensorHistory";
import ConnectionStatus from "@/components/ConnectionStatus";
import { Waves } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Reading {
  id: string;
  distance: number;
  timestamp: string;
  device_id: string;
}

const Index = () => {
  const [currentReading, setCurrentReading] = useState<Reading | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Cargar lecturas iniciales
  useEffect(() => {
    loadReadings();
  }, []);

  // Suscribirse a actualizaciones en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel('sensor-readings-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings'
        },
        (payload) => {
          console.log('Nueva lectura recibida:', payload);
          const newReading = payload.new as Reading;
          setCurrentReading(newReading);
          setReadings(prev => [newReading, ...prev].slice(0, 50));
          setIsConnected(true);
          
          toast({
            title: "Nueva lectura",
            description: `${Number(newReading.distance).toFixed(2)} cm`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const loadReadings = async () => {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error cargando lecturas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las lecturas",
        variant: "destructive",
      });
      return;
    }

    if (data && data.length > 0) {
      setReadings(data);
      setCurrentReading(data[0]);
      setIsConnected(true);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Waves className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Sensor Ultrasónico HC-SR04
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitoreo en tiempo real vía WiFi
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <ConnectionStatus 
            isConnected={isConnected} 
            deviceId={currentReading?.device_id || 'ESP32-001'} 
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Reading */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {currentReading ? (
              <SensorCard
                distance={Number(currentReading.distance)}
                lastUpdate={new Date(currentReading.timestamp)}
              />
            ) : (
              <div className="p-8 bg-card rounded-xl border border-border/50 text-center">
                <p className="text-muted-foreground">Esperando primera lectura...</p>
              </div>
            )}
          </div>

          {/* History */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <SensorHistory readings={readings} />
          </div>
        </div>

        {/* API Info */}
        <div className="mt-8 p-6 bg-secondary/30 rounded-xl border border-border/30 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Información de Conexión ESP32
          </h3>
          <div className="space-y-2 text-sm font-mono">
            <p className="text-muted-foreground">
              <span className="text-primary font-semibold">URL:</span>{" "}
              <code className="bg-background/50 px-2 py-1 rounded">
                https://yhmmhnsigttiioquvzqi.supabase.co/functions/v1/sensor-api
              </code>
            </p>
            <p className="text-muted-foreground">
              <span className="text-primary font-semibold">Método:</span> POST
            </p>
            <p className="text-muted-foreground">
              <span className="text-primary font-semibold">Body JSON:</span>{" "}
              <code className="bg-background/50 px-2 py-1 rounded">
                {`{ "distance": 25.5, "device_id": "ESP32-001" }`}
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
