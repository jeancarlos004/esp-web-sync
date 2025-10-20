import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Circle } from "lucide-react";
import { API_CONFIG, getHeaders, handleApiResponse } from "@/config/api";

interface ButtonState {
  button_number: number;
  state: boolean;
  timestamp: string;
}

const ButtonDisplay = ({ deviceId }: { deviceId: string }) => {
  const [buttons, setButtons] = useState<ButtonState[]>([]);

  useEffect(() => {
    loadButtonStates();
    const interval = setInterval(loadButtonStates, 1000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const loadButtonStates = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/button/history?limit=3&device_id=${deviceId}`,
        { headers: getHeaders(true) }
      );
      const data = await handleApiResponse(response);

      const latest = [1, 2, 3].map((num) => {
        const button = data.find((b: ButtonState) => b.button_number === num);
        return button || { button_number: num, state: false, timestamp: "" };
      });
      setButtons(latest);
    } catch (error) {
      console.error("Error loading button states:", error);
    }
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
