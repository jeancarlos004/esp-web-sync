-- Corregir la función para incluir search_path
CREATE OR REPLACE FUNCTION public.initialize_leds(p_device_id text DEFAULT 'ESP32-001')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.led_states (led_number, state, device_id)
  SELECT led_num, false, p_device_id
  FROM generate_series(1, 3) AS led_num
  ON CONFLICT DO NOTHING;
END;
$$;