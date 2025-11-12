import { MetricsChart } from "@/components/dashboard/MetricsChart";
import { OriginChart } from "@/components/dashboard/OriginChart";
import { VisitsChart } from "@/components/dashboard/VisitsChart";
import { LeadsEvolutionChart } from "@/components/dashboard/LeadsEvolutionChart";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useImoveis } from "@/hooks/useImoveis";
import { usePropostas } from "@/hooks/usePropostas";

export default function Metrics() {
  const { data: metrics } = useDashboardMetrics();
  const { data: imoveis } = useImoveis();
  const { data: propostas } = usePropostas();

  // Calcular métricas de propostas por status
  const propostasPorStatus = propostas?.reduce((acc, proposta) => {
    const status = proposta.status === 'em_analise' ? 'Em Análise' 
      : proposta.status === 'aceita' ? 'Aceita'
      : proposta.status === 'recusada' ? 'Recusada'
      : proposta.status === 'pendente' ? 'Pendente'
      : 'Cancelada';
    
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.valor++;
    } else {
      acc.push({ name: status, valor: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; valor: number }>) || [];

  // Calcular imóveis por tipo
  const imoveisPorTipo = imoveis?.reduce((acc, imovel) => {
    const existing = acc.find(item => item.name === imovel.tipo);
    if (existing) {
      existing.valor++;
    } else {
      acc.push({ name: imovel.tipo, valor: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; valor: number }>) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Métricas e Análises</h1>
        <p className="text-muted-foreground">
          Visualização detalhada de dados e indicadores de performance
        </p>
      </div>

      {/* Evolução de Leads - Destaque Principal */}
      <div className="grid grid-cols-1">
        <LeadsEvolutionChart />
      </div>

      {/* Métricas de Propostas e Imóveis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricsChart 
          data={propostasPorStatus}
          title="Propostas por Status"
        />
        <MetricsChart 
          data={imoveisPorTipo}
          title="Imóveis por Tipo"
        />
      </div>

      {/* Origem de Leads e Visitas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics?.leadsPorOrigem && metrics.leadsPorOrigem.length > 0 && (
          <OriginChart data={metrics.leadsPorOrigem} />
        )}
        <VisitsChart />
      </div>
    </div>
  );
}
