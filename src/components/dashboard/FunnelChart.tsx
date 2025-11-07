import { Card } from "@/components/ui/card";

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

const stages: FunnelStage[] = [
  { name: "Novos Leads", count: 245, percentage: 100, color: "bg-status-new" },
  { name: "Contato Inicial", count: 189, percentage: 77, color: "bg-primary" },
  { name: "Qualificados", count: 142, percentage: 58, color: "bg-status-qualified" },
  { name: "Visita Agendada", count: 98, percentage: 40, color: "bg-warning" },
  { name: "Proposta Enviada", count: 67, percentage: 27, color: "bg-status-proposal" },
  { name: "Negociação", count: 45, percentage: 18, color: "bg-secondary" },
  { name: "Vendido", count: 28, percentage: 11, color: "bg-status-won" },
];

export function FunnelChart() {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-6">Funil de Vendas</h3>
      <div className="space-y-3">
        {stages.map((stage, index) => (
          <div key={stage.name} className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{stage.name}</span>
              <span className="text-sm text-muted-foreground">
                {stage.count} ({stage.percentage}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-8 relative overflow-hidden">
              <div
                className={`h-full ${stage.color} rounded-full transition-all duration-500 flex items-center justify-end px-3`}
                style={{ width: `${stage.percentage}%` }}
              >
                <span className="text-xs font-medium text-white">
                  {stage.count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
