import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface SensorCardProps {
  distance: number;
  lastUpdate: Date;
}

const SensorCard = ({ distance, lastUpdate }: SensorCardProps) => {
  return (
    <Card className="p-8 bg-gradient-to-br from-card to-card/80 border-border/50 shadow-lg">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Activity className="w-8 h-8 text-primary animate-pulse-glow" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-muted-foreground">Distancia Actual</h3>
          <p className="text-sm text-muted-foreground/60">Sensor Ultrasónico HC-SR04</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-bold text-primary" style={{ textShadow: 'var(--shadow-glow)' }}>
            {distance.toFixed(2)}
          </span>
          <span className="text-2xl text-muted-foreground">cm</span>
        </div>
        
        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Última actualización:{" "}
            <span className="text-foreground font-medium">
              {lastUpdate.toLocaleTimeString('es-ES')}
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SensorCard;
