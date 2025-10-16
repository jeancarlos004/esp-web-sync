import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Monitor } from "lucide-react";

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
    subscribeToLcdChanges();
  }, [deviceId]);

  const loadLcdMessages = async () => {
    const { data, error } = await supabase
      .from("lcd_messages")
      .select("*")
      .eq("device_id", deviceId)
      .order("timestamp", { ascending: false })
      .limit(2);

    if (error) {
      console.error("Error loading LCD messages:", error);
      return;
    }

    if (data && data.length > 0) {
      const line1 = data.find((m) => m.line === 1)?.message || "";
      const line2 = data.find((m) => m.line === 2)?.message || "";
      setMessages({ line1, line2 });
    }
  };

  const subscribeToLcdChanges = () => {
    const channel = supabase
      .channel("lcd-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lcd_messages",
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          const newMessage = payload.new as LcdMessage;
          setMessages((prev) => ({
            ...prev,
            [`line${newMessage.line}`]: newMessage.message,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
