import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import ConnectionStatus from "@/components/ConnectionStatus";
import LedControl from "@/components/LedControl";
import ButtonDisplay from "@/components/ButtonDisplay";
import LcdDisplay from "@/components/LcdDisplay";
import SensorCard from "@/components/SensorCard";
import SensorHistory from "@/components/SensorHistory";
import { API_CONFIG } from "@/config/api";

const Control = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Verificar conexión con la API
    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
        setConnected(response.ok);
      } catch {
        setConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground">
            Panel de Sistema de Control
          </h1>
          <ConnectionStatus isConnected={connected} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SensorCard />
          <LedControl deviceId={API_CONFIG.DEVICE_ID} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ButtonDisplay deviceId={API_CONFIG.DEVICE_ID} />
          <LcdDisplay deviceId={API_CONFIG.DEVICE_ID} />
        </div>

        <SensorHistory />
      </div>
    </div>
  );
};

export default Control;
