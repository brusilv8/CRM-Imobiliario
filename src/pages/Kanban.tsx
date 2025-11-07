import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useFunilEtapas, useLeadsFunil, useUpdateLeadEtapa } from "@/hooks/useFunilEtapas";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { LeadCard } from "@/components/kanban/LeadCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lead, LeadFunil } from "@/types/database.types";

export default function Kanban() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data: etapas, isLoading: etapasLoading } = useFunilEtapas();
  const { data: leadsFunil, isLoading: leadsFunilLoading } = useLeadsFunil();
  const updateLeadEtapa = useUpdateLeadEtapa();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const leadId = active.id as string;
    const newEtapaId = over.id as string;

    updateLeadEtapa.mutate({ leadId, etapaId: newEtapaId });
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  if (etapasLoading || leadsFunilLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pipeline de Vendas</h1>
          <p className="text-muted-foreground">Gerencie seus leads no funil</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-80">
              <Skeleton className="h-[600px]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeLead = activeId
    ? leadsFunil?.find((lf: LeadFunil) => lf.lead_id === activeId)?.lead
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pipeline de Vendas</h1>
        <p className="text-muted-foreground">
          Arraste os cards para mover leads entre as etapas
        </p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {etapas?.map((etapa) => {
            const leadsNaEtapa = leadsFunil?.filter(
              (lf: LeadFunil) => lf.etapa_id === etapa.id
            ) || [];

            return (
              <KanbanColumn
                key={etapa.id}
                etapa={etapa}
                leads={leadsNaEtapa}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
