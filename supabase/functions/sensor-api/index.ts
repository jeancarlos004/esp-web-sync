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
