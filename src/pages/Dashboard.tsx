import { 
  Users, 
  TrendingUp, 
  Home,
  Calendar,
  FileText,
  Target
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { AtividadesRecentes } from "@/components/dashboard/AtividadesRecentes";
import { MetricsChart } from "@/components/dashboard/MetricsChart";
import { OriginChart } from "@/components/dashboard/OriginChart";
import { VisitsChart } from "@/components/dashboard/VisitsChart";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useImoveis } from "@/hooks/useImoveis";
import { usePropostas } from "@/hooks/usePropostas";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
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
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do desempenho de vendas
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Leads Ativos"
          value={metricsLoading ? "-" : metrics?.totalLeads || 0}
          icon={Users}
          iconColor="bg-primary"
        />
        <StatCard
          title="Taxa de Conversão"
          value={metricsLoading ? "-" : `${metrics?.taxaConversao || 0}%`}
          icon={TrendingUp}
          iconColor="bg-secondary"
        />
        <StatCard
          title="Imóveis Cadastrados"
          value={imoveis?.length || 0}
          icon={Home}
          iconColor="bg-status-qualified"
        />
        <StatCard
          title="Visitas Hoje"
          value={metricsLoading ? "-" : metrics?.visitasHoje || 0}
          icon={Calendar}
          iconColor="bg-warning"
        />
        <StatCard
          title="Propostas em Análise"
          value={metricsLoading ? "-" : metrics?.propostasAnalise || 0}
          icon={FileText}
          iconColor="bg-status-proposal"
        />
        <StatCard
          title="Propostas Aceitas"
          value={propostas?.filter(p => p.status === 'aceita').length || 0}
          icon={Target}
          iconColor="bg-secondary"
        />
      </div>

      {/* Charts Section - Funil e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FunnelChart />
        </div>
        <div>
          <AtividadesRecentes />
        </div>
      </div>

      {/* Charts Section - Métricas Detalhadas */}
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

      {/* Charts Section - Origem e Visitas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics?.leadsPorOrigem && metrics.leadsPorOrigem.length > 0 && (
          <OriginChart data={metrics.leadsPorOrigem} />
        )}
        <VisitsChart />
      </div>
    </div>
  );
}
