// Edge Function: Notification dispatch
// POST /functions/v1/send-notification
// Sends push (OneSignal), SMS/voice (Twilio), and in-app notifications

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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload = await req.json();

    // TODO Phase 3: Implement full notification dispatch
    // 1. Determine recipient list from entity or explicit user_ids
    // 2. Fetch each recipient's notification preferences
    // 3. For critical alerts: always send push + SMS regardless of preferences
    // 4. Dispatch to OneSignal (push) using ONESIGNAL_APP_ID and ONESIGNAL_API_KEY
    // 5. Dispatch to Twilio (SMS/voice) using TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
    // 6. Write notification record for in-app display
    // 7. For critical unacknowledged alerts: schedule escalation check

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: 0,
        message: "Notification dispatch stub - implement in Phase 3",
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
