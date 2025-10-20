import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { sensorService, SensorReading } from "@/services/sensorService";

const SensorCard = () => {
  const [lastReading, setLastReading] = useState<SensorReading | null>(null);

  useEffect(() => {
    loadLatestReading();
    const interval = setInterval(loadLatestReading, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadLatestReading = async () => {
    try {
      const readings = await sensorService.getHistory(1);
      if (readings && readings.length > 0) {
        setLastReading(readings[0]);
      }
    } catch (error) {
      console.error("Error loading sensor data:", error);
    }
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-border/50 shadow-lg">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Activity className="w-8 h-8 text-primary animate-pulse-glow" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-muted-foreground">Distancia Actual</h3>
          <p className="text-sm text-muted-foreground/60">Sensor Ultrasónico HC-SR05</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-bold text-primary" style={{ textShadow: 'var(--shadow-glow)' }}>
            {lastReading ? Number(lastReading.distance).toFixed(2) : "---"}
          </span>
          <span className="text-2xl text-muted-foreground">cm</span>
        </div>
        
        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Última actualización:{" "}
            <span className="text-foreground font-medium">
              {lastReading 
                ? new Date(lastReading.timestamp).toLocaleTimeString('es-ES')
                : "Esperando datos..."}
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SensorCard;
