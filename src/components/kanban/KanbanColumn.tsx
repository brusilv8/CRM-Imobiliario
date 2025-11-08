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
    <div ref={setNodeRef} className="flex-shrink-0 w-80">
      <Card className={`h-full transition-all ${isOver ? 'ring-2 ring-primary shadow-lg' : 'shadow-sm'}`}>
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: etapa.cor }}
              />
              <h3 className="font-bold text-base">{etapa.nome}</h3>
            </div>
            <Badge 
              className="text-sm font-semibold px-2.5 py-1"
              style={{ 
                backgroundColor: `${etapa.cor}20`,
                color: etapa.cor,
                border: `1px solid ${etapa.cor}40`
              }}
            >
              {leads.length}
            </Badge>
          </div>
          
          {leads.length > 0 && (
            <div className="text-xs text-muted-foreground font-medium">
              ⌀ {tempoMedio} {tempoMedio === 1 ? 'dia' : 'dias'} nesta etapa
            </div>
          )}
        </div>

        <div className="p-3 space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto">
          {leads.map((leadFunil) => (
            <LeadCard
              key={leadFunil.id}
              lead={leadFunil.lead!}
              dataEntrada={leadFunil.data_entrada}
              onClick={() => onLeadClick?.(leadFunil.lead)}
            />
          ))}

          {leads.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <div className="mb-2 opacity-50">📋</div>
              Nenhum lead nesta etapa
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
