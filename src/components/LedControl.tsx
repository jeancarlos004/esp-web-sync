import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Lightbulb, LightbulbOff } from "lucide-react";
import { ledService, LedState } from "@/services/ledService";

const LedControl = ({ deviceId }: { deviceId: string }) => {
  const [leds, setLeds] = useState<LedState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLedStates();
    const interval = setInterval(loadLedStates, 1000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const loadLedStates = async () => {
    try {
      const data = await ledService.getStates();
      setLeds(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error cargando estados de LEDs:", error);
      setIsLoading(false);
    }
  };

  // Función para obtener el estado del LED por número
  const getLedState = (ledNumber: number): boolean => {
    const led = leds.find((l) => l.led_number === ledNumber);
    return led?.state || false;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Estado de LEDs</h2>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((num) => {
            const isOn = getLedState(num);
            return (
              <div 
                key={num}
                className={`p-6 rounded-lg flex flex-col items-center justify-center gap-2 ${
                  isOn 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-muted/50 text-muted-foreground'
                }`}
              >
                {isOn ? (
                  <Lightbulb className="w-8 h-8" />
                ) : (
                  <LightbulbOff className="w-8 h-8" />
                )}
                <span className="font-medium">LED {num}</span>
                <span className="text-sm">
                  {isOn ? 'ENCENDIDO' : 'APAGADO'}
                </span>
              </div>
            );
          })}
        </div>
      )}
      
      <p className="text-sm text-muted-foreground mt-4 text-center">
        Usa los botones físicos para controlar los LEDs
      </p>
    </Card>
  );
};

export default LedControl;
