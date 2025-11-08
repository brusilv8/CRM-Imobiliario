import { useDroppable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeadCard } from "./LeadCard";
import type { FunilEtapa, LeadFunil } from "@/types/database.types";

interface KanbanColumnProps {
  etapa: FunilEtapa;
  leads: LeadFunil[];
  onLeadClick?: (lead: any) => void;
}

export function KanbanColumn({ etapa, leads, onLeadClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: etapa.id,
  });

  const tempoMedio = leads.length > 0
    ? Math.round(
        leads.reduce((acc, lf) => {
          const dias = Math.floor(
            (new Date().getTime() - new Date(lf.data_entrada).getTime()) / (1000 * 60 * 60 * 24)
          );
          return acc + dias;
        }, 0) / leads.length
      )
    : 0;

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-72">
      <Card className={`p-3 h-full transition-colors ${isOver ? 'bg-muted/50' : ''}`}>
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: etapa.cor }}
              />
              <h3 className="font-semibold text-sm">{etapa.nome}</h3>
            </div>
            <Badge variant="secondary" className="text-xs">{leads.length}</Badge>
          </div>
          
          {leads.length > 0 && (
            <div className="text-xs text-muted-foreground">
              ⌀ {tempoMedio} {tempoMedio === 1 ? 'dia' : 'dias'} nesta etapa
            </div>
          )}
        </div>

        <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {leads.map((leadFunil) => (
            <LeadCard
              key={leadFunil.id}
              lead={leadFunil.lead!}
              dataEntrada={leadFunil.data_entrada}
              onClick={() => onLeadClick?.(leadFunil.lead)}
            />
          ))}

          {leads.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-xs">
              Nenhum lead
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
