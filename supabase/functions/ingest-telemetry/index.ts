// Edge Function: IoT telemetry ingestion
// POST /functions/v1/ingest-telemetry
// Receives sensor payloads, validates, writes to sensor_readings, evaluates alert rules

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-api-key, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate API key (for IoT device authentication)
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload = await req.json();

    // TODO Phase 3: Implement full telemetry ingestion
    // 1. Validate payload schema
    // 2. Resolve device_id -> elevator_id
    // 3. Batch insert into sensor_readings
    // 4. Evaluate alert rules against new readings
    // 5. Trigger notifications if thresholds breached

    return new Response(
      JSON.stringify({
        success: true,
        readings_stored: 0,
        alerts_generated: 0,
        message: "Telemetry ingestion stub - implement in Phase 3",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
