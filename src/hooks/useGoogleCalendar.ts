import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useGoogleCalendarStatus() {
  return useQuery({
    queryKey: ['google-calendar-status'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { connected: false };

      const { data, error } = await supabase
        .from('google_calendar_tokens')
        .select('id, created_at, webhook_expiry')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking Google Calendar status:', error);
        return { connected: false };
      }

      return { 
        connected: !!data,
        connectedAt: data?.created_at,
        webhookExpiry: data?.webhook_expiry
      };
    },
  });
}

export function useConnectGoogleCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      // Obter URL de autorização
      const { data, error } = await supabase.functions.invoke('google-calendar-auth');

      if (error) throw error;
      if (!data?.authUrl) throw new Error('URL de autorização não recebida');

      // Abrir popup de autorização
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authWindow = window.open(
        data.authUrl,
        'Google Calendar Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!authWindow) {
        throw new Error('Popup bloqueado. Por favor, permita popups para este site.');
      }

      // Aguardar callback
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          try {
            if (authWindow.closed) {
              clearInterval(checkInterval);
              reject(new Error('Autorização cancelada'));
            }

            // Verificar se a janela foi redirecionada para o callback
            const authUrl = authWindow.location.href;
            if (authUrl.includes('code=')) {
              const url = new URL(authUrl);
              const code = url.searchParams.get('code');
              
              if (code) {
                authWindow.close();
                clearInterval(checkInterval);

                // Trocar código por tokens
                supabase.functions.invoke('google-calendar-callback', {
                  body: { code, userId: session.user.id }
                }).then(({ data, error }) => {
                  if (error) reject(error);
                  else resolve(data);
                });
              }
            }
          } catch (e) {
            // Ignorar erros de CORS ao verificar URL
          }
        }, 500);

        // Timeout após 5 minutos
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!authWindow.closed) {
            authWindow.close();
          }
          reject(new Error('Tempo de autorização esgotado'));
        }, 5 * 60 * 1000);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-status'] });
      toast.success('Google Calendar conectado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao conectar Google Calendar:', error);
      toast.error(error.message || 'Erro ao conectar Google Calendar');
    },
  });
}

export function useDisconnectGoogleCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('google_calendar_tokens')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-status'] });
      toast.success('Google Calendar desconectado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao desconectar Google Calendar');
    },
  });
}
