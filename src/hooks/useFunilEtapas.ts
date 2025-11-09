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
          lead:leads!inner(*),
          etapa:funil_etapas(*)
        `)
        .eq('lead.finalizado', false)
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
      // Validação no frontend antes de enviar
      if (!leadId || !etapaId) {
        throw new Error('Lead ID e Etapa ID são obrigatórios');
      }

      if (typeof leadId !== 'string' || typeof etapaId !== 'string') {
        throw new Error('Lead ID e Etapa ID devem ser strings válidas');
      }

      try {
        // Delete existing
        const { error: deleteError } = await supabase
          .from('lead_funil')
          .delete()
          .eq('lead_id', leadId);

        if (deleteError) {
          console.error('Erro ao deletar lead_funil:', {
            error: deleteError,
            message: deleteError.message,
            details: deleteError.details,
            hint: deleteError.hint,
            code: deleteError.code
          });
          throw new Error(`Erro ao remover lead do funil: ${deleteError.message}`);
        }

        // Insert new
        const dataEntrada = new Date().toISOString();
        const { data, error: insertError } = await supabase
          .from('lead_funil')
          .insert({
            lead_id: leadId,
            etapa_id: etapaId,
            data_entrada: dataEntrada
          })
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao inserir lead_funil:', {
            error: insertError,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code,
            payload: { lead_id: leadId, etapa_id: etapaId, data_entrada: dataEntrada }
          });
          throw new Error(`Erro ao adicionar lead ao funil: ${insertError.message}`);
        }

        // Create interaction - validar campos obrigatórios
        const { error: interactionError } = await supabase
          .from('lead_interacoes')
          .insert({
            lead_id: leadId,
            tipo: 'observacao',
            descricao: 'Lead movido no funil'
          });

        if (interactionError) {
          console.error('Erro ao criar interação:', {
            error: interactionError,
            message: interactionError.message,
            details: interactionError.details,
            hint: interactionError.hint,
            code: interactionError.code,
            payload: { lead_id: leadId, tipo: 'observacao', descricao: 'Lead movido no funil' }
          });
          // Não falhar a operação se a interação falhar, apenas logar
          console.warn('Falha ao registrar interação, mas lead foi movido com sucesso');
        }

        // Register system activity
        const { data: lead } = await supabase
          .from('leads')
          .select('nome')
          .eq('id', leadId)
          .single();

        const { data: novaEtapa } = await supabase
          .from('funil_etapas')
          .select('nome')
          .eq('id', etapaId)
          .single();

        if (novaEtapa) {
          const { error: activityError } = await supabase
            .from('atividades_sistema')
            .insert({
              tipo: 'etapa_alterada',
              titulo: `${lead?.nome || 'Lead'} movido para ${novaEtapa.nome}`,
              descricao: `Lead avançou no funil de vendas`,
              lead_id: leadId,
              metadata: { 
                etapa_nova: novaEtapa.nome 
              }
            });

          if (activityError) {
            console.error('Erro ao registrar atividade:', {
              error: activityError,
              message: activityError.message,
              details: activityError.details,
              hint: activityError.hint,
              code: activityError.code
            });
            // Não falhar a operação se a atividade falhar
            console.warn('Falha ao registrar atividade, mas lead foi movido com sucesso');
          }
        }

        // Update last contact
        const { error: updateError } = await supabase
          .from('leads')
          .update({ 
            ultimo_contato: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', leadId);

        if (updateError) {
          console.error('Erro ao atualizar lead:', {
            error: updateError,
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            code: updateError.code,
            payload: { ultimo_contato: new Date().toISOString(), updated_at: new Date().toISOString() }
          });
          // Não falhar a operação se a atualização falhar, apenas logar
          console.warn('Falha ao atualizar último contato, mas lead foi movido com sucesso');
        }

        return data;
      } catch (error: any) {
        // Log detalhado do erro
        console.error('Erro completo ao mover lead:', {
          error,
          message: error?.message,
          stack: error?.stack,
          leadId,
          etapaId
        });
        throw error;
      }
    },
    onMutate: async ({ leadId, etapaId }) => {
      // Cancelar queries em andamento para evitar sobrescrever atualizações otimistas
      await queryClient.cancelQueries({ queryKey: ['leads_funil'] });

      // Snapshot do valor anterior
      const previousLeadsFunil = queryClient.getQueryData(['leads_funil']);

      // Atualização otimista: atualizar o cache imediatamente
      queryClient.setQueryData(['leads_funil'], (old: any) => {
        if (!old) return old;
        return old.map((lf: LeadFunil) => {
          if (lf.lead_id === leadId) {
            return {
              ...lf,
              etapa_id: etapaId,
              data_entrada: new Date().toISOString()
            };
          }
          return lf;
        });
      });

      // Retornar contexto com snapshot para rollback em caso de erro
      return { previousLeadsFunil };
    },
    onError: (error: any, variables, context) => {
      // Rollback em caso de erro
      if (context?.previousLeadsFunil) {
        queryClient.setQueryData(['leads_funil'], context.previousLeadsFunil);
      }
      const errorMessage = error?.message || 'Erro ao mover lead';
      console.error('Erro na mutation useUpdateLeadEtapa:', {
        error,
        message: errorMessage,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      toast.error(errorMessage);
    },
    onSuccess: () => {
      // Invalidar queries para garantir sincronização com o backend
      queryClient.invalidateQueries({ queryKey: ['leads_funil'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['atividades-sistema'] });
      // Toast removido para não ser intrusivo - a UI já foi atualizada otimisticamente
    },
  });
}

export function useSyncLeadsToFunil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Get all leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id');

      if (leadsError) throw leadsError;

      // Get all leads already in funnel
      const { data: leadsFunil, error: funilError } = await supabase
        .from('lead_funil')
        .select('lead_id');

      if (funilError) throw funilError;

      const leadIdsInFunil = new Set(leadsFunil?.map((lf) => lf.lead_id) || []);
      const leadsToAdd = leads?.filter((lead) => !leadIdsInFunil.has(lead.id)) || [];

      if (leadsToAdd.length === 0) {
        return { synced: 0 };
      }

      // Get first funnel stage
      const { data: etapa, error: etapaError } = await supabase
        .from('funil_etapas')
        .select('id')
        .order('ordem', { ascending: true })
        .limit(1)
        .single();

      if (etapaError) throw etapaError;

      // Add all leads to first stage
      const { error: insertError } = await supabase
        .from('lead_funil')
        .insert(
          leadsToAdd.map((lead) => ({
            lead_id: lead.id,
            etapa_id: etapa.id,
            data_entrada: new Date().toISOString()
          }))
        );

      if (insertError) throw insertError;

      return { synced: leadsToAdd.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads_funil'] });
      if (data.synced > 0) {
        toast.success(`${data.synced} lead(s) sincronizado(s) com sucesso!`);
      } else {
        toast.info('Todos os leads já estão no funil');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao sincronizar leads');
    },
  });
}
