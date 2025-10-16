import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Circle } from "lucide-react";

interface ButtonState {
  button_number: number;
  state: boolean;
  timestamp: string;
}

const ButtonDisplay = ({ deviceId }: { deviceId: string }) => {
  const [buttons, setButtons] = useState<ButtonState[]>([]);

  useEffect(() => {
    loadButtonStates();
    subscribeToButtonChanges();
  }, [deviceId]);

  const loadButtonStates = async () => {
    const { data, error } = await supabase
      .from("button_states")
      .select("*")
      .eq("device_id", deviceId)
      .order("timestamp", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Error loading button states:", error);
      return;
    }

    if (data) {
      const latest = [1, 2, 3].map((num) => {
        const button = data.find((b) => b.button_number === num);
        return button || { button_number: num, state: false, timestamp: "" };
      });
      setButtons(latest);
    }
  };

  const subscribeToButtonChanges = () => {
    const channel = supabase
      .channel("button-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "button_states",
          filter: `device_id=eq.${deviceId}`,
        },
        () => {
          loadButtonStates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Estado de Pulsadores</h2>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((num) => {
          const button = buttons.find((b) => b.button_number === num);
          const isPressed = button?.state || false;

          return (
            <div
              key={num}
              className={`p-4 rounded-lg border-2 transition-all ${
                isPressed
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Circle
                  className={`w-8 h-8 ${
                    isPressed ? "fill-primary text-primary" : "text-muted-foreground"
                  }`}
                />
                <span className="text-sm font-medium">Botón {num}</span>
                <span className="text-xs text-muted-foreground">
                  {isPressed ? "Presionado" : "Sin presionar"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ButtonDisplay;
