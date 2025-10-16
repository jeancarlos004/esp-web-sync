import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const endpoint = url.pathname.split('/').pop();

    // GET /led-states - Obtener estado de los LEDs
    if (req.method === 'GET' && endpoint === 'led-states') {
      const device_id = url.searchParams.get('device_id') || 'ESP32-001';
      
      const { data, error } = await supabase
        .from('led_states')
        .select('*')
        .eq('device_id', device_id)
        .order('led_number', { ascending: true });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // POST /update-led - Actualizar estado de un LED
    if (req.method === 'POST' && endpoint === 'update-led') {
      const { led_number, state, device_id = 'ESP32-001' } = await req.json();

      if (!led_number || state === undefined) {
        throw new Error('led_number and state are required');
      }

      // Buscar el LED existente
      const { data: existing } = await supabase
        .from('led_states')
        .select('id')
        .eq('device_id', device_id)
        .eq('led_number', led_number)
        .maybeSingle();

      let result;
      if (existing) {
        // Actualizar LED existente
        result = await supabase
          .from('led_states')
          .update({ state, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        // Crear nuevo LED
        result = await supabase
          .from('led_states')
          .insert({ led_number, state, device_id })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      console.log(`LED ${led_number} updated to ${state}`);

      return new Response(
        JSON.stringify({ success: true, data: result.data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // POST /button - Registrar estado de pulsador
    if (req.method === 'POST' && endpoint === 'button') {
      const { button_number, state, device_id = 'ESP32-001' } = await req.json();

      if (!button_number || state === undefined) {
        throw new Error('button_number and state are required');
      }

      const { data, error } = await supabase
        .from('button_states')
        .insert({ button_number, state, device_id })
        .select()
        .single();

      if (error) throw error;

      console.log(`Button ${button_number} pressed: ${state}`);

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // POST /lcd - Registrar mensaje del LCD
    if (req.method === 'POST' && endpoint === 'lcd') {
      const { message, line = 1, device_id = 'ESP32-001' } = await req.json();

      if (!message) {
        throw new Error('message is required');
      }

      const { data, error } = await supabase
        .from('lcd_messages')
        .insert({ message, line, device_id })
        .select()
        .single();

      if (error) throw error;

      console.log(`LCD message: ${message}`);

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // POST /sensor - Lectura del sensor (original)
    const { distance, device_id = 'ESP32-001' } = await req.json();
    
    console.log(`Received reading from ${device_id}: ${distance}cm`);

    if (distance === undefined || distance === null) {
      throw new Error('Distance value is required');
    }

    // Validar que la distancia sea un número válido
    const distanceNum = parseFloat(distance);
    if (isNaN(distanceNum) || distanceNum < 0 || distanceNum > 400) {
      throw new Error('Invalid distance value. Must be between 0 and 400 cm');
    }

    // Insertar la lectura en la base de datos
    const { data, error } = await supabase
      .from('sensor_readings')
      .insert({
        distance: distanceNum,
        device_id: device_id,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Reading saved successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reading saved successfully',
        data: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
