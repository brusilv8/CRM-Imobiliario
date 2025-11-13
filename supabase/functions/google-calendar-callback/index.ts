import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, userId } = await req.json();
    
    const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET');
    const origin = req.headers.get('origin') || '';
    const redirectUri = `${origin}/google-calendar-callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Google Calendar credentials not configured');
    }

    console.log('Exchanging code for tokens...');
    console.log('Redirect URI:', redirectUri);

    // Trocar código por tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error(`Failed to exchange code: ${errorText}`);
    }

    const tokens = await tokenResponse.json();
    console.log('Tokens received successfully');

    // Salvar tokens no Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const tokenExpiry = new Date(Date.now() + (tokens.expires_in * 1000));

    const { error: dbError } = await supabase
      .from('google_calendar_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: tokenExpiry.toISOString(),
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Tokens saved successfully');

    // Configurar webhook do Google Calendar
    try {
      const calendarResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events/watch',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: crypto.randomUUID(),
            type: 'web_hook',
            address: `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-webhook`,
          }),
        }
      );

      if (calendarResponse.ok) {
        const webhookData = await calendarResponse.json();
        console.log('Webhook configured:', webhookData);

        await supabase
          .from('google_calendar_tokens')
          .update({
            webhook_channel_id: webhookData.id,
            webhook_resource_id: webhookData.resourceId,
            webhook_expiry: new Date(parseInt(webhookData.expiration)).toISOString(),
          })
          .eq('user_id', userId);
      }
    } catch (webhookError) {
      console.error('Webhook setup failed:', webhookError);
      // Não falhar a autenticação se o webhook falhar
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in google-calendar-callback:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
