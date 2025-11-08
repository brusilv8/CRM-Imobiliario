import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      // Total leads ativos
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      // Visitas hoje
      const today = new Date().toISOString().split('T')[0];
      const { count: visitasHoje } = await supabase
        .from('visitas')
        .select('*', { count: 'exact', head: true })
        .gte('data_hora', today)
        .lt('data_hora', `${today}T23:59:59`)
        .eq('status', 'agendada');

      // Propostas em análise
      const { count: propostasAnalise } = await supabase
        .from('propostas')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'em_analise');

      // Taxa de conversão (propostas aprovadas / total de leads)
      const { count: propostasAprovadas } = await supabase
        .from('propostas')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aprovada');

      const taxaConversao = totalLeads && totalLeads > 0 
        ? ((propostasAprovadas || 0) / totalLeads * 100).toFixed(1)
        : '0';

      // Leads por origem
      const { data: leadsPorOrigem } = await supabase
        .from('leads')
        .select('origem');

      const origemCounts: Record<string, number> = {};
      leadsPorOrigem?.forEach(lead => {
        origemCounts[lead.origem] = (origemCounts[lead.origem] || 0) + 1;
      });

      return {
        totalLeads: totalLeads || 0,
        visitasHoje: visitasHoje || 0,
        propostasAnalise: propostasAnalise || 0,
        taxaConversao: parseFloat(taxaConversao),
        leadsPorOrigem: Object.entries(origemCounts).map(([origem, total]) => ({
          origem,
          total
        }))
      };
    },
    refetchInterval: 60000, // Auto-refresh every 60s
  });
}

export function useFunnelData() {
  return useQuery({
    queryKey: ['funnel-data'],
    queryFn: async () => {
      const { data: etapas } = await supabase
        .from('funil_etapas')
        .select('*')
        .order('ordem', { ascending: true });

      if (!etapas) return [];

      const funnelData = await Promise.all(
        etapas.map(async (etapa) => {
          const { count } = await supabase
            .from('lead_funil')
            .select('*', { count: 'exact', head: true })
            .eq('etapa_id', etapa.id);

          return {
            name: etapa.nome,
            value: count || 0,
            color: etapa.cor
          };
        })
      );

      return funnelData;
    },
    refetchInterval: 60000,
  });
}

export function useRecentActivities() {
  return useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('lead_interacoes')
        .select(`
          *,
          lead:leads(nome),
          usuario:usuarios(nome_completo)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      return data || [];
    },
    refetchInterval: 60000,
  });
}
