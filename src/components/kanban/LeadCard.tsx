import { useDraggable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, Flame, Sun, Snowflake } from "lucide-react";
import type { Lead } from "@/types/database.types";
import { differenceInDays } from "date-fns";

interface LeadCardProps {
  lead: Lead;
  dataEntrada?: string;
  isDragging?: boolean;
  onClick?: () => void;
}

const temperaturaConfig = {
  hot: { icon: Flame, color: "text-destructive", bg: "bg-destructive/10" },
  warm: { icon: Sun, color: "text-warning", bg: "bg-warning/10" },
  cold: { icon: Snowflake, color: "text-primary", bg: "bg-primary/10" },
};

export function LeadCard({ lead, dataEntrada, isDragging, onClick }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const diasParado = dataEntrada
    ? differenceInDays(new Date(), new Date(dataEntrada))
    : 0;

  const temConfig = temperaturaConfig[lead.temperatura];
  const TempIcon = temConfig.icon;
  
  const borderColor = temConfig.color === 'text-destructive' 
    ? 'hsl(var(--destructive))' 
    : temConfig.color === 'text-warning' 
    ? 'hsl(var(--warning))' 
    : 'hsl(var(--primary))';

  const cardStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        borderLeftColor: borderColor
      }
    : { borderLeftColor: borderColor };

  return (
    <Card
      ref={setNodeRef}
      style={cardStyle}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (onClick && !isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`p-4 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all border-l-4 ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-base mb-1 truncate">{lead.nome}</h4>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{lead.telefone}</span>
            </div>
            {lead.email && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{lead.email}</span>
              </div>
            )}
          </div>
          <div className={`p-2 rounded-full ${temConfig.bg} flex-shrink-0`}>
            <TempIcon className={`w-4 h-4 ${temConfig.color}`} />
          </div>
        </div>

        {lead.interesse && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {lead.interesse}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {lead.origem}
          </Badge>
          
          {lead.orcamento_max && (
            <Badge variant="secondary" className="text-xs">
              até R$ {lead.orcamento_max.toLocaleString('pt-BR')}
            </Badge>
          )}
          
          {diasParado > 0 && (
            <Badge 
              variant={diasParado > 7 ? 'destructive' : 'secondary'} 
              className="text-xs"
            >
              {diasParado === 0 ? 'hoje' : `${diasParado}d parado`}
            </Badge>
          )}
        </div>

        {lead.observacoes && (
          <p className="text-xs text-muted-foreground italic line-clamp-1 pt-1 border-t">
            {lead.observacoes}
          </p>
        )}
      </div>
    </Card>
  );
}
