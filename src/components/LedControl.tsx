import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, LightbulbOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ledService, LedState } from "@/services/ledService";


const LedControl = ({ deviceId }: { deviceId: string }) => {
  const [leds, setLeds] = useState<LedState[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadLedStates();
    const interval = setInterval(loadLedStates, 1000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const loadLedStates = async () => {
    try {
      const data = await ledService.getStates();
      setLeds(data);
    } catch (error) {
      console.error("Error loading LED states:", error);
    }
  };

  const toggleLed = async (ledNumber: number, currentState: boolean) => {
    const newState = !currentState;

    try {
      await ledService.updateLed(ledNumber, newState);
      toast({
        title: `LED ${ledNumber}`,
        description: `${newState ? "Encendido" : "Apagado"}`,
      });
      loadLedStates();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el LED",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Control de LEDs</h2>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((num) => {
          const led = leds.find((l) => l.led_number === num);
          const isOn = led?.state || false;

          return (
            <Button
              key={num}
              onClick={() => toggleLed(num, isOn)}
              variant={isOn ? "default" : "outline"}
              className="h-24 flex flex-col items-center justify-center gap-2"
            >
              {isOn ? (
                <Lightbulb className="w-8 h-8" />
              ) : (
                <LightbulbOff className="w-8 h-8" />
              )}
              <span>LED {num}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default LedControl;
