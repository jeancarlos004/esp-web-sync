
-- Tabla para almacenar las mediciones del sensor ultrasónico
CREATE TABLE public.sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  distance DECIMAL(10, 2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  device_id TEXT NOT NULL DEFAULT 'ESP32-001',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice para consultas rápidas por timestamp
CREATE INDEX idx_sensor_readings_timestamp ON public.sensor_readings(timestamp DESC);

-- Índice para consultas por dispositivo
CREATE INDEX idx_sensor_readings_device ON public.sensor_readings(device_id);

-- Habilitar realtime para actualizaciones en tiempo real
ALTER TABLE public.sensor_readings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;

-- RLS: Hacer la tabla pública para que el ESP32 pueda escribir y cualquiera leer
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción sin autenticación (para el ESP32)
CREATE POLICY "Allow public insert" 
ON public.sensor_readings 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Política para permitir lectura sin autenticación
CREATE POLICY "Allow public read" 
ON public.sensor_readings 
FOR SELECT 
TO anon
USING (true);
