import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Phone, 
  Mail, 
  Calendar, 
  FileText,
  Home,
  TrendingUp
} from "lucide-react";

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'proposal' | 'property' | 'sale';
  title: string;
  description: string;
  time: string;
  user: string;
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'sale',
    title: 'Venda Concluída',
    description: 'Apartamento 3 quartos - Centro',
    time: 'Há 15 minutos',
    user: 'Marina Silva'
  },
  {
    id: '2',
    type: 'meeting',
    title: 'Visita Agendada',
    description: 'Casa em condomínio - Bairro Alto',
    time: 'Há 32 minutos',
    user: 'Carlos Santos'
  },
  {
    id: '3',
    type: 'proposal',
    title: 'Nova Proposta',
    description: 'Cobertura duplex - Vista mar',
    time: 'Há 1 hora',
    user: 'Ana Paula'
  },
  {
    id: '4',
    type: 'call',
    title: 'Ligação Realizada',
    description: 'Follow-up com cliente interessado',
    time: 'Há 2 horas',
    user: 'Roberto Lima'
  },
  {
    id: '5',
    type: 'property',
    title: 'Novo Imóvel Cadastrado',
    description: 'Apartamento 2 quartos - Zona Sul',
    time: 'Há 3 horas',
    user: 'Juliana Costa'
  }
];

const iconMap = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  proposal: FileText,
  property: Home,
  sale: TrendingUp
};

const colorMap = {
  call: 'bg-primary',
  email: 'bg-secondary',
  meeting: 'bg-warning',
  proposal: 'bg-status-proposal',
  property: 'bg-status-qualified',
  sale: 'bg-status-won'
};

export function RecentActivity() {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-6">Atividades Recentes</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = iconMap[activity.type];
          const colorClass = colorMap[activity.type];
          
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {activity.user}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
