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
import { QuickLeadFormModal } from "@/components/kanban/QuickLeadFormModal";
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
import { RefreshCw, Filter, X, Flame, Sun, Snowflake, Users, ChevronRight, ChevronLeft } from "lucide-react";
import type { Lead, LeadFunil } from "@/types/database.types";

export default function Kanban() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [quickFormOpen, setQuickFormOpen] = useState(false);
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

  const scrollToEnd = () => {
    const container = document.querySelector('.kanban-scroll');
    if (container) {
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    }
  };

  const scrollToStart = () => {
    const container = document.querySelector('.kanban-scroll');
    if (container) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    }
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
    <div className="space-y-3">
      <div>
        <h1 className="text-2xl font-bold mb-3">Funil de Vendas</h1>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant={filters.temperatura === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, temperatura: 'all' })}
            >
              Todos
            </Button>
            <Button
              variant={filters.temperatura === 'hot' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, temperatura: 'hot' })}
              className="gap-1.5"
            >
              <Flame className="w-3.5 h-3.5" />
              Quente
            </Button>
            <Button
              variant={filters.temperatura === 'warm' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, temperatura: 'warm' })}
              className="gap-1.5"
            >
              <Sun className="w-3.5 h-3.5" />
              Morno
            </Button>
            <Button
              variant={filters.temperatura === 'cold' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ ...filters, temperatura: 'cold' })}
              className="gap-1.5"
            >
              <Snowflake className="w-3.5 h-3.5" />
              Frio
            </Button>
          </div>

          <Select
            value={filters.origem}
            onValueChange={(value) => setFilters({ ...filters, origem: value })}
          >
            <SelectTrigger className="w-[140px] h-9">
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

          <Button 
            className="gap-2 bg-primary hover:bg-primary/90 h-9"
            onClick={() => setQuickFormOpen(true)}
          >
            <Users className="w-4 h-4" />
            Novo Atendimento
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => syncLeads.mutate()}
            disabled={syncLeads.isPending}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncLeads.isPending ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Botão fixo para voltar ao início */}
      <Button
        variant="outline"
        size="icon"
        onClick={scrollToStart}
        className="fixed left-6 top-1/2 -translate-y-1/2 z-40 shadow-lg hover:shadow-xl transition-shadow"
        title="Voltar ao início"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      {/* Botão fixo para ir ao final */}
      <Button
        variant="outline"
        size="icon"
        onClick={scrollToEnd}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 shadow-lg hover:shadow-xl transition-shadow"
        title="Ir para o final"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-2.5 overflow-x-auto pb-3 kanban-scroll">
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

      <QuickLeadFormModal
        open={quickFormOpen}
        onOpenChange={setQuickFormOpen}
      />
    </div>
  );
}
