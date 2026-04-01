// Edge Function: Geofence event processing
// POST /functions/v1/geofence-event
// Processes mobile geofence enter/exit events

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const payload = await req.json();

    // TODO Phase 3: Implement full geofence processing
    // 1. Validate payload (building_id, event_type, coords, accuracy)
    // 2. Verify GPS accuracy meets minimum threshold
    // 3. Write geofence_event record
    // 4. If enter: find active service_event for user at this building, link it, calculate travel_time
    // 5. If exit: update service_event departed_at, calculate on-site duration
    // 6. Update vendor_locations table

    return new Response(
      JSON.stringify({
        success: true,
        event_id: null,
        service_event_linked: false,
        message: "Geofence event stub - implement in Phase 3",
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
