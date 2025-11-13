import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Visita } from '@/types/database.types';
import { toast } from 'sonner';

export function useVisitas() {
  return useQuery({
    queryKey: ['visitas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visitas')
        .select(`
          *,
          lead:leads(*),
          imovel:imoveis(*)
        `)
        .order('data_hora', { ascending: true });

      if (error) throw error;
      return data as Visita[];
    },
  });
}

export function useCreateVisita() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visita: Omit<Visita, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('visitas')
        .insert(visita)
        .select()
        .single();

      if (error) throw error;

      // Create interaction
      await supabase.from('lead_interacoes').insert({
        lead_id: visita.lead_id,
        tipo: 'visita',
        descricao: `Visita agendada para ${new Date(visita.data_hora).toLocaleString('pt-BR')}`
      });

      // Sincronizar com Google Calendar
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.functions.invoke('google-calendar-sync', {
            body: { 
              action: 'create',
              visitaId: data.id,
              visitaData: data
            }
          });
        }
      } catch (syncError) {
        console.error('Erro ao sincronizar com Google Calendar:', syncError);
        // Não falhar a criação se a sincronização falhar
      }

      return data as Visita;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] });
      toast.success('Visita agendada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao agendar visita');
    },
  });
}

export function useUpdateVisita() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Visita> & { id: string }) => {
      const { data, error } = await supabase
        .from('visitas')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Sincronizar com Google Calendar
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.functions.invoke('google-calendar-sync', {
            body: { 
              action: 'update',
              visitaId: id,
              visitaData: data
            }
          });
        }
      } catch (syncError) {
        console.error('Erro ao sincronizar com Google Calendar:', syncError);
      }

      return data as Visita;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] });
      toast.success('Visita atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar visita');
    },
  });
}
