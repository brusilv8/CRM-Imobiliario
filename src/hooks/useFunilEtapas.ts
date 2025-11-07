import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { FunilEtapa, LeadFunil } from '@/types/database.types';
import { toast } from 'sonner';

export function useFunilEtapas() {
  return useQuery({
    queryKey: ['funil_etapas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funil_etapas')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data as FunilEtapa[];
    },
  });
}

export function useLeadsFunil() {
  return useQuery({
    queryKey: ['leads_funil'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_funil')
        .select(`
          *,
          lead:leads(*),
          etapa:funil_etapas(*)
        `)
        .order('data_entrada', { ascending: false });

      if (error) throw error;
      return data as LeadFunil[];
    },
  });
}

export function useUpdateLeadEtapa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, etapaId }: { leadId: string; etapaId: string }) => {
      // Delete existing
      await supabase
        .from('lead_funil')
        .delete()
        .eq('lead_id', leadId);

      // Insert new
      const { data, error } = await supabase
        .from('lead_funil')
        .insert({
          lead_id: leadId,
          etapa_id: etapaId,
          data_entrada: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Create interaction
      await supabase.from('lead_interacoes').insert({
        lead_id: leadId,
        tipo: 'observacao',
        descricao: 'Lead movido no funil'
      });

      // Update last contact
      await supabase
        .from('leads')
        .update({ ultimo_contato: new Date().toISOString() })
        .eq('id', leadId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads_funil'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead movido no funil!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao mover lead');
    },
  });
}
