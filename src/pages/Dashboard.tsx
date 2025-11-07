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
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function Dashboard() {
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
          value={245}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          iconColor="bg-primary"
        />
        <StatCard
          title="Taxa de Conversão"
          value="11.4%"
          icon={TrendingUp}
          trend={{ value: 2.3, isPositive: true }}
          iconColor="bg-secondary"
        />
        <StatCard
          title="Imóveis Cadastrados"
          value={156}
          icon={Home}
          trend={{ value: 8, isPositive: true }}
          iconColor="bg-status-qualified"
        />
        <StatCard
          title="Visitas Hoje"
          value={12}
          icon={Calendar}
          iconColor="bg-warning"
        />
        <StatCard
          title="Propostas Pendentes"
          value={23}
          icon={FileText}
          iconColor="bg-status-proposal"
        />
        <StatCard
          title="Meta do Mês"
          value="68%"
          icon={Target}
          trend={{ value: -5, isPositive: false }}
          iconColor="bg-primary-dark"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FunnelChart />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
