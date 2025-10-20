import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock } from "lucide-react";
import { sensorService, SensorReading } from "@/services/sensorService";

const SensorHistory = () => {
  const [readings, setReadings] = useState<SensorReading[]>([]);

  useEffect(() => {
    loadReadings();
    const interval = setInterval(loadReadings, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadReadings = async () => {
    try {
      const data = await sensorService.getHistory(50);
      setReadings(data);
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/80 border-border/50 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Historial de Lecturas</h3>
      </div>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {readings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay lecturas disponibles
            </p>
          ) : (
            readings.map((reading) => (
              <div
                key={reading.id}
                className="p-4 bg-secondary/50 rounded-lg border border-border/30 hover:bg-secondary/70 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {Number(reading.distance).toFixed(2)} cm
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(reading.timestamp).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground/60">
                    {reading.device_id}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default SensorHistory;
