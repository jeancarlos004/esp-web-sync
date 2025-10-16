import { Card } from "@/components/ui/card";
import { Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusProps {
  isConnected: boolean;
  deviceId: string;
}

const ConnectionStatus = ({ isConnected, deviceId }: ConnectionStatusProps) => {
  return (
    <Card className="p-4 bg-gradient-to-br from-card to-card/80 border-border/50">
      <div className="flex items-center gap-3">
        {isConnected ? (
          <>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wifi className="w-5 h-5 text-primary animate-pulse-glow" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Conectado</p>
              <p className="text-xs text-muted-foreground">{deviceId}</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-2 bg-destructive/10 rounded-lg">
              <WifiOff className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Desconectado</p>
              <p className="text-xs text-muted-foreground">Esperando datos...</p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default ConnectionStatus;
