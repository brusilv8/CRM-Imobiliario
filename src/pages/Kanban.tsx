import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useFunilEtapas, useLeadsFunil, useUpdateLeadEtapa, useSyncLeadsToFunil } from "@/hooks/useFunilEtapas";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { LeadCard } from "@/components/kanban/LeadCard";
import { LeadDetailModal } from "@/components/kanban/LeadDetailModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Filter, X, Flame, Sun, Snowflake } from "lucide-react";
import type { Lead, LeadFunil } from "@/types/database.types";

export default function Kanban() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    temperatura: 'all',
    origem: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: etapas, isLoading: etapasLoading } = useFunilEtapas();
  const { data: leadsFunil, isLoading: leadsFunilLoading } = useLeadsFunil();
  const updateLeadEtapa = useUpdateLeadEtapa();
  const syncLeads = useSyncLeadsToFunil();

  // Get unique origins
  const origens = useMemo(() => {
    if (!leadsFunil) return [];
    const uniqueOrigins = new Set(leadsFunil.map((lf) => lf.lead?.origem).filter(Boolean));
    return Array.from(uniqueOrigins);
  }, [leadsFunil]);

  // Filter leads
  const filteredLeadsFunil = useMemo(() => {
    if (!leadsFunil) return [];
    return leadsFunil.filter((lf) => {
      if (!lf.lead) return false;
      
      if (filters.temperatura !== 'all' && lf.lead.temperatura !== filters.temperatura) {
        return false;
      }
      
      if (filters.origem !== 'all' && lf.lead.origem !== filters.origem) {
        return false;
      }
      
      return true;
    });
  }, [leadsFunil, filters]);

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length;

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

    if (!over) return;

    const leadId = active.id as string;
    const newEtapaId = over.id as string;

    const currentLeadFunil = filteredLeadsFunil?.find((lf: LeadFunil) => lf.lead_id === leadId);
    if (currentLeadFunil?.etapa_id === newEtapaId) return;

    updateLeadEtapa.mutate({ leadId, etapaId: newEtapaId });
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailModalOpen(true);
  };

  const clearFilters = () => {
    setFilters({ temperatura: 'all', origem: 'all' });
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  if (etapasLoading || leadsFunilLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Pipeline de Vendas</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus leads no funil</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-72">
              <Skeleton className="h-[500px]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeLead = activeId
    ? filteredLeadsFunil?.find((lf: LeadFunil) => lf.lead_id === activeId)?.lead
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Pipeline de Vendas</h1>
          <p className="text-sm text-muted-foreground">
            Arraste os cards para mover leads entre as etapas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncLeads.mutate()}
            disabled={syncLeads.isPending}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncLeads.isPending ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Select
                value={filters.temperatura}
                onValueChange={(value) =>
                  setFilters({ ...filters, temperatura: value })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Temperatura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas temperaturas</SelectItem>
                  <SelectItem value="hot">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-destructive" />
                      Quente
                    </div>
                  </SelectItem>
                  <SelectItem value="warm">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-warning" />
                      Morno
                    </div>
                  </SelectItem>
                  <SelectItem value="cold">
                    <div className="flex items-center gap-2">
                      <Snowflake className="w-4 h-4 text-primary" />
                      Frio
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Select
                value={filters.origem}
                onValueChange={(value) =>
                  setFilters({ ...filters, origem: value })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas origens</SelectItem>
                  {origens.map((origem) => (
                    <SelectItem key={origem} value={origem}>
                      {origem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Limpar filtros
              </Button>
            )}
          </div>
        </Card>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-3 overflow-x-auto pb-4">
          {etapas?.map((etapa) => {
            const leadsNaEtapa = filteredLeadsFunil?.filter(
              (lf: LeadFunil) => lf.etapa_id === etapa.id
            ) || [];

            return (
              <KanbanColumn
                key={etapa.id}
                etapa={etapa}
                leads={leadsNaEtapa}
                onLeadClick={handleLeadClick}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      <LeadDetailModal
        lead={selectedLead}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
}
