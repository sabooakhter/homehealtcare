import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface TimeTrackingEvent {
  caregiver_id: string;
  event_type: 'check_in' | 'check_out';
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { caregiver_id, event_type, timestamp } = await req.json() as TimeTrackingEvent;

    if (event_type === 'check_in') {
      // Update caregiver status and check-in time
      const { error: updateError } = await supabaseClient
        .from('caregivers')
        .update({
          status: 'checked_in',
          check_in_time: timestamp,
          check_out_time: null
        })
        .eq('id', caregiver_id);

      if (updateError) throw updateError;

    } else if (event_type === 'check_out') {
      // Get caregiver's check-in time
      const { data: caregiver, error: fetchError } = await supabaseClient
        .from('caregivers')
        .select('check_in_time')
        .eq('id', caregiver_id)
        .single();

      if (fetchError) throw fetchError;
      if (!caregiver.check_in_time) throw new Error('No check-in time found');

      // Calculate duration in minutes
      const checkInTime = new Date(caregiver.check_in_time);
      const checkOutTime = new Date(timestamp);
      const duration = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / 60000);

      // Begin transaction
      const { error: transactionError } = await supabaseClient.rpc('handle_check_out', {
        p_caregiver_id: caregiver_id,
        p_check_in_time: caregiver.check_in_time,
        p_check_out_time: timestamp,
        p_duration: duration
      });

      if (transactionError) throw transactionError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});