import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function refreshTokenIfNeeded(supabase: any, userId: string, tokens: any) {
  const tokenExpiry = new Date(tokens.token_expiry);
  const now = new Date();
  
  // Refresh se expirar em menos de 5 minutos
  if (tokenExpiry.getTime() - now.getTime() < 5 * 60 * 1000) {
    console.log('Refreshing access token...');
    
    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET')!,
        refresh_token: tokens.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    const newTokens = await refreshResponse.json();
    const newExpiry = new Date(Date.now() + (newTokens.expires_in * 1000));

    await supabase
      .from('google_calendar_tokens')
      .update({
        access_token: newTokens.access_token,
        token_expiry: newExpiry.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return newTokens.access_token;
  }

  return tokens.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, visitaId, visitaData } = await req.json();
    console.log('Sync action:', action, 'for visita:', visitaId);

    // Buscar tokens do usuário
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Google Calendar not connected');
    }

    const accessToken = await refreshTokenIfNeeded(supabase, user.id, tokenData);

    if (action === 'create' || action === 'update') {
      // Buscar dados completos da visita
      const { data: visita } = await supabase
        .from('visitas')
        .select('*, lead:leads(*), imovel:imoveis(*)')
        .eq('id', visitaId)
        .single();

      if (!visita) {
        throw new Error('Visita not found');
      }

      // Verificar se já existe sincronização
      const { data: syncData } = await supabase
        .from('visitas_google_sync')
        .select('google_event_id')
        .eq('visita_id', visitaId)
        .eq('user_id', user.id)
        .maybeSingle();

      const eventData = {
        summary: `Visita: ${visita.lead?.nome || 'Lead'} - ${visita.imovel?.endereco || 'Imóvel'}`,
        description: `
Tipo: ${visita.tipo}
Lead: ${visita.lead?.nome || 'N/A'}
Email: ${visita.lead?.email || 'N/A'}
Telefone: ${visita.lead?.telefone || 'N/A'}
Imóvel: ${visita.imovel?.endereco || 'N/A'}
Observações: ${visita.observacoes || 'Nenhuma'}
        `.trim(),
        start: {
          dateTime: visita.data_hora,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: new Date(new Date(visita.data_hora).getTime() + (visita.duracao || 60) * 60000).toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        status: visita.status === 'cancelada' ? 'cancelled' : 'confirmed',
      };

      let googleEventId = syncData?.google_event_id;

      if (action === 'create' && !googleEventId) {
        // Criar evento no Google Calendar
        const createResponse = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
          }
        );

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error('Failed to create event:', errorText);
          throw new Error(`Failed to create Google Calendar event: ${errorText}`);
        }

        const createdEvent = await createResponse.json();
        googleEventId = createdEvent.id;
        console.log('Created Google Calendar event:', googleEventId);

        // Salvar sincronização
        await supabase
          .from('visitas_google_sync')
          .insert({
            visita_id: visitaId,
            google_event_id: googleEventId,
            user_id: user.id,
          });
      } else if (action === 'update' && googleEventId) {
        // Atualizar evento no Google Calendar
        const updateResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
          }
        );

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('Failed to update event:', errorText);
          throw new Error(`Failed to update Google Calendar event: ${errorText}`);
        }

        console.log('Updated Google Calendar event:', googleEventId);

        // Atualizar timestamp de sincronização
        await supabase
          .from('visitas_google_sync')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('visita_id', visitaId)
          .eq('user_id', user.id);
      }
    } else if (action === 'delete') {
      // Buscar ID do evento no Google
      const { data: syncData } = await supabase
        .from('visitas_google_sync')
        .select('google_event_id')
        .eq('visita_id', visitaId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (syncData?.google_event_id) {
        // Deletar evento no Google Calendar
        await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${syncData.google_event_id}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        );

        console.log('Deleted Google Calendar event:', syncData.google_event_id);

        // Remover sincronização
        await supabase
          .from('visitas_google_sync')
          .delete()
          .eq('visita_id', visitaId)
          .eq('user_id', user.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in google-calendar-sync:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
