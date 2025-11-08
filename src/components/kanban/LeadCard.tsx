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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (onClick && !isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 rotate-3 scale-105' : ''
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        <Avatar className="w-8 h-8">
          <AvatarFallback className={temConfig.bg}>
            {lead.nome.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{lead.nome}</h4>
          <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lead.telefone}</span>
          </div>
        </div>
        <div className={`p-1 rounded-full ${temConfig.bg}`}>
          <TempIcon className={`w-3 h-3 ${temConfig.color}`} />
        </div>
      </div>

      {lead.interesse && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
          {lead.interesse}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-xs py-0">
          {lead.origem}
        </Badge>
        {diasParado > 7 && (
          <Badge variant="destructive" className="text-xs py-0">
            {diasParado}d
          </Badge>
        )}
      </div>
    </Card>
  );
}
