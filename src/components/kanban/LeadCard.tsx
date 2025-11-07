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
}

const temperaturaConfig = {
  hot: { icon: Flame, color: "text-destructive", bg: "bg-destructive/10" },
  warm: { icon: Sun, color: "text-warning", bg: "bg-warning/10" },
  cold: { icon: Snowflake, color: "text-primary", bg: "bg-primary/10" },
};

export function LeadCard({ lead, dataEntrada, isDragging }: LeadCardProps) {
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 rotate-3 scale-105' : ''
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback className={temConfig.bg}>
            {lead.nome.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{lead.nome}</h4>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="w-3 h-3" />
            {lead.telefone}
          </div>
          {lead.email && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="w-3 h-3" />
              {lead.email}
            </div>
          )}
        </div>
        <div className={`p-1.5 rounded-full ${temConfig.bg}`}>
          <TempIcon className={`w-4 h-4 ${temConfig.color}`} />
        </div>
      </div>

      {lead.interesse && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {lead.interesse}
        </p>
      )}

      {(lead.orcamento_min || lead.orcamento_max) && (
        <p className="text-xs font-medium mb-2">
          {lead.orcamento_min?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          {lead.orcamento_max && ` - ${lead.orcamento_max.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {lead.origem}
        </Badge>
        {diasParado > 7 && (
          <Badge variant="destructive" className="text-xs">
            {diasParado}d parado
          </Badge>
        )}
      </div>

      {lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {lead.tags.slice(0, 2).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {lead.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{lead.tags.length - 2}
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
}
