-- Tabla para estado de LEDs
CREATE TABLE public.led_states (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  led_number integer NOT NULL CHECK (led_number >= 1 AND led_number <= 3),
  state boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  device_id text NOT NULL DEFAULT 'ESP32-001'
);

-- Tabla para estado de pulsadores
CREATE TABLE public.button_states (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  button_number integer NOT NULL CHECK (button_number >= 1 AND button_number <= 3),
  state boolean NOT NULL DEFAULT false,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  device_id text NOT NULL DEFAULT 'ESP32-001'
);

-- Tabla para mensajes del LCD
CREATE TABLE public.lcd_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message text NOT NULL,
  line integer NOT NULL CHECK (line >= 1 AND line <= 2),
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  device_id text NOT NULL DEFAULT 'ESP32-001'
);

-- Habilitar RLS
ALTER TABLE public.led_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.button_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lcd_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados
CREATE POLICY "Authenticated users can read LED states"
  ON public.led_states FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update LED states"
  ON public.led_states FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert LED states"
  ON public.led_states FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read button states"
  ON public.button_states FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read LCD messages"
  ON public.lcd_messages FOR SELECT
  TO authenticated
  USING (true);

-- Políticas públicas para el ESP32 (sin autenticación)
CREATE POLICY "Public can read LED states"
  ON public.led_states FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert button states"
  ON public.button_states FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can insert LCD messages"
  ON public.lcd_messages FOR INSERT
  TO anon
  WITH CHECK (true);

-- Índices para mejorar rendimiento
CREATE INDEX idx_led_states_device_led ON public.led_states(device_id, led_number);
CREATE INDEX idx_button_states_device_time ON public.button_states(device_id, timestamp DESC);
CREATE INDEX idx_lcd_messages_device_time ON public.lcd_messages(device_id, timestamp DESC);

-- Función para inicializar LEDs si no existen
CREATE OR REPLACE FUNCTION public.initialize_leds(p_device_id text DEFAULT 'ESP32-001')
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.led_states (led_number, state, device_id)
  SELECT led_num, false, p_device_id
  FROM generate_series(1, 3) AS led_num
  ON CONFLICT DO NOTHING;
END;
$$;

-- Habilitar realtime para actualizaciones en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.led_states;
ALTER PUBLICATION supabase_realtime ADD TABLE public.button_states;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lcd_messages;