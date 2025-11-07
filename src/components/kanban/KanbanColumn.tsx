import { useDroppable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeadCard } from "./LeadCard";
import type { FunilEtapa, LeadFunil } from "@/types/database.types";

interface KanbanColumnProps {
  etapa: FunilEtapa;
  leads: LeadFunil[];
}

export function KanbanColumn({ etapa, leads }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: etapa.id,
  });

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80">
      <Card className={`p-4 h-full transition-colors ${isOver ? 'bg-muted/50' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: etapa.cor }}
            />
            <h3 className="font-semibold">{etapa.nome}</h3>
          </div>
          <Badge variant="secondary">{leads.length}</Badge>
        </div>

        {etapa.descricao && (
          <p className="text-xs text-muted-foreground mb-4">
            {etapa.descricao}
          </p>
        )}

        <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          {leads.map((leadFunil) => (
            <LeadCard
              key={leadFunil.id}
              lead={leadFunil.lead!}
              dataEntrada={leadFunil.data_entrada}
            />
          ))}

          {leads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum lead nesta etapa
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
