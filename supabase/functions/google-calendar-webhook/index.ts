import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

serve(async (req) => {
  try {
    const channelId = req.headers.get('x-goog-channel-id');
    const resourceId = req.headers.get('x-goog-resource-id');
    const resourceState = req.headers.get('x-goog-resource-state');

    console.log('Webhook received:', { channelId, resourceId, resourceState });

    if (resourceState === 'sync') {
      // Confirmação inicial do webhook
      return new Response(null, { status: 200 });
    }

    if (resourceState !== 'exists') {
      // Ignorar outros estados
      return new Response(null, { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar usuário associado ao webhook
    const { data: tokenData } = await supabase
      .from('google_calendar_tokens')
      .select('user_id, access_token')
      .eq('webhook_channel_id', channelId)
      .single();

    if (!tokenData) {
      console.log('No user found for webhook channel');
      return new Response(null, { status: 200 });
    }

    console.log('Syncing events for user:', tokenData.user_id);

    // Buscar eventos recentes do Google Calendar
    const eventsResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + 
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() + // Últimas 24h
      '&singleEvents=true&orderBy=startTime',
      {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      }
    );

    if (!eventsResponse.ok) {
      console.error('Failed to fetch events from Google Calendar');
      return new Response(null, { status: 200 });
    }

    const eventsData = await eventsResponse.json();
    console.log('Fetched', eventsData.items?.length || 0, 'events');

    // Processar eventos alterados
    for (const event of eventsData.items || []) {
      // Verificar se o evento está sincronizado com uma visita
      const { data: syncData } = await supabase
        .from('visitas_google_sync')
        .select('visita_id')
        .eq('google_event_id', event.id)
        .eq('user_id', tokenData.user_id)
        .maybeSingle();

      if (syncData) {
        console.log('Updating visita from Google event:', event.id);

        // Atualizar visita no CRM
        const startTime = event.start?.dateTime || event.start?.date;
        const endTime = event.end?.dateTime || event.end?.date;
        
        if (startTime && endTime) {
          const duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);

          await supabase
            .from('visitas')
            .update({
              data_hora: startTime,
              duracao: duration,
              status: event.status === 'cancelled' ? 'cancelada' : 
                     event.status === 'confirmed' ? 'agendada' : 'agendada',
              updated_at: new Date().toISOString(),
            })
            .eq('id', syncData.visita_id);

          // Atualizar timestamp de sincronização
          await supabase
            .from('visitas_google_sync')
            .update({ last_synced_at: new Date().toISOString() })
            .eq('visita_id', syncData.visita_id)
            .eq('user_id', tokenData.user_id);
        }
      }
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Error in google-calendar-webhook:', error);
    return new Response(null, { status: 500 });
  }
});
