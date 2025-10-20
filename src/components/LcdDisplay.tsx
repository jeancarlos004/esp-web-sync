import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Monitor } from "lucide-react";
import { API_CONFIG, getHeaders, handleApiResponse } from "@/config/api";

interface LcdMessage {
  message: string;
  line: number;
  timestamp: string;
}

const LcdDisplay = ({ deviceId }: { deviceId: string }) => {
  const [messages, setMessages] = useState<{ line1: string; line2: string }>({
    line1: "Esperando datos...",
    line2: "",
  });

  useEffect(() => {
    loadLcdMessages();
    const interval = setInterval(loadLcdMessages, 2000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const loadLcdMessages = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/lcd/current?device_id=${deviceId}`,
        { headers: getHeaders(true) }
      );
      const data = await handleApiResponse(response);

      if (data && data.length > 0) {
        const line1 = data.find((m: LcdMessage) => m.line === 1)?.message || "";
        const line2 = data.find((m: LcdMessage) => m.line === 2)?.message || "";
        setMessages({ line1, line2 });
      }
    } catch (error) {
      console.error("Error loading LCD messages:", error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Monitor className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Display LCD</h2>
      </div>
      <div className="bg-[#1a472a] p-6 rounded-lg font-mono text-[#7cfc00] space-y-2">
        <div className="text-lg tracking-wider">{messages.line1}</div>
        <div className="text-lg tracking-wider">{messages.line2}</div>
      </div>
    </Card>
  );
};

export default LcdDisplay;
