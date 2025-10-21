import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Circle, Power } from "lucide-react";
import { API_CONFIG, getHeaders, handleApiResponse } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

interface ButtonState {
  button_number: number;
  state: boolean;
  timestamp: string;
}

const ButtonDisplay = ({ deviceId }: { deviceId: string }) => {
  const [buttons, setButtons] = useState<ButtonState[]>([]);
  const { toast } = useToast();

  // Cargar el estado inicial de los botones
  useEffect(() => {
    loadButtonStates();
    const interval = setInterval(loadButtonStates, 1000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const loadButtonStates = async () => {
    try {
      // Obtener el estado actual de los LEDs que refleja el estado de los botones
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/led/status?device_id=${deviceId}`,
        { headers: getHeaders(true) }
      );
      const data = await handleApiResponse(response);
      
      if (data.success) {
        // Mapear el estado de los LEDs a los botones
        const buttonStates = [1, 2, 3].map((num) => ({
          button_number: num,
          state: data.leds[num] || false,
          timestamp: new Date().toISOString()
        }));
        setButtons(buttonStates);
      }
    } catch (error) {
      console.error("Error loading button states:", error);
    }
  };

  // Manejar el clic en un botón
  const handleButtonClick = async (buttonNumber: number) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/button/press`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          device_id: deviceId,
          button_number: buttonNumber
        })
      });
      
      const result = await handleApiResponse(response);
      
      if (result.success) {
        // Actualizar el estado local del botón
        setButtons(prev => 
          prev.map(b => 
            b.button_number === buttonNumber 
              ? { ...b, state: result.led_state, timestamp: new Date().toISOString() } 
              : b
          )
        );
        
        toast({
          title: `Pulsador ${buttonNumber}`,
          description: `LED ${buttonNumber} ${result.led_state ? 'encendido' : 'apagado'}`,
        });
      }
    } catch (error) {
      console.error("Error handling button press:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar el pulsador",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Control por Pulsadores</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Haz clic en un botón para alternar el estado del LED correspondiente
      </p>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((num) => {
          const button = buttons.find((b) => b.button_number === num) || { state: false };
          const isPressed = button.state;

          return (
            <button
              key={num}
              onClick={() => handleButtonClick(num)}
              className={`p-6 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                isPressed 
                  ? 'bg-green-100 border-green-500 text-green-700' 
                  : 'bg-muted/50 border-muted-foreground/20 text-muted-foreground'
              } border-2 hover:shadow-md`}
            >
              <Power
                className={`w-8 h-8 mb-2 ${
                  isPressed ? 'text-green-500' : 'text-muted-foreground/50'
                }`}
              />
              <span className="font-medium">Pulsador {num}</span>
              <span className="text-xs text-muted-foreground">
                {isPressed ? 'LED ENCENDIDO' : 'LED APAGADO'}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default ButtonDisplay;
