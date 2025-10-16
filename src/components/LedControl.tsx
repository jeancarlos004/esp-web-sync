import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, LightbulbOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LedState {
  id: string;
  led_number: number;
  state: boolean;
}

const LedControl = ({ deviceId }: { deviceId: string }) => {
  const [leds, setLeds] = useState<LedState[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadLedStates();
    subscribeToLedChanges();
  }, [deviceId]);

  const loadLedStates = async () => {
    const { data, error } = await supabase
      .from("led_states")
      .select("*")
      .eq("device_id", deviceId)
      .order("led_number", { ascending: true });

    if (error) {
      console.error("Error loading LED states:", error);
      return;
    }

    if (data) {
      setLeds(data);
    }
  };

  const subscribeToLedChanges = () => {
    const channel = supabase
      .channel("led-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "led_states",
          filter: `device_id=eq.${deviceId}`,
        },
        () => {
          loadLedStates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const toggleLed = async (ledNumber: number, currentState: boolean) => {
    const newState = !currentState;

    const { error } = await supabase.functions.invoke("sensor-api/update-led", {
      body: {
        led_number: ledNumber,
        state: newState,
        device_id: deviceId,
      },
    });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el LED",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `LED ${ledNumber}`,
      description: `${newState ? "Encendido" : "Apagado"}`,
    });
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
