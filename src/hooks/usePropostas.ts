import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Proposta } from '@/types/database.types';
import { toast } from 'sonner';

export function usePropostas() {
  return useQuery({
    queryKey: ['propostas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('propostas')
        .select(`
          *,
          lead:leads(*),
          imovel:imoveis(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Proposta[];
    },
  });
}

export function useCreateProposta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposta: Omit<Proposta, 'id' | 'created_at' | 'codigo'>) => {
      // Generate codigo
      const codigo = `PROP-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('propostas')
        .insert({ ...proposta, codigo })
        .select()
        .single();

      if (error) throw error;

      // Create interaction
      await supabase.from('lead_interacoes').insert({
        lead_id: proposta.lead_id,
        tipo: 'proposta',
        descricao: `Proposta ${codigo} criada no valor de ${proposta.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
      });

      return data as Proposta;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propostas'] });
      toast.success('Proposta criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar proposta');
    },
  });
}

export function useUpdateProposta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Proposta> & { id: string }) => {
      const { data, error } = await supabase
        .from('propostas')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Proposta;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propostas'] });
      toast.success('Proposta atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar proposta');
    },
  });
}
