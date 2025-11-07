import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Flame,
  Snowflake,
  Sun
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  temperature: 'cold' | 'warm' | 'hot';
  status: string;
  lastContact: string;
  budget: string;
  interest: string;
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 98765-4321',
    source: 'Site',
    temperature: 'hot',
    status: 'Qualificado',
    lastContact: 'Hoje, 14:30',
    budget: 'R$ 500.000',
    interest: 'Apartamento 3 quartos'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 97654-3210',
    source: 'Portal Imobiliário',
    temperature: 'warm',
    status: 'Contato Inicial',
    lastContact: 'Ontem, 16:45',
    budget: 'R$ 350.000',
    interest: 'Casa em condomínio'
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@email.com',
    phone: '(11) 96543-2109',
    source: 'Indicação',
    temperature: 'hot',
    status: 'Visita Agendada',
    lastContact: 'Hoje, 10:15',
    budget: 'R$ 800.000',
    interest: 'Cobertura'
  },
  {
    id: '4',
    name: 'Ana Paula',
    email: 'ana@email.com',
    phone: '(11) 95432-1098',
    source: 'Facebook Ads',
    temperature: 'cold',
    status: 'Novo Lead',
    lastContact: 'Há 3 dias',
    budget: 'R$ 250.000',
    interest: 'Apartamento 2 quartos'
  }
];

const temperatureIcons = {
  cold: Snowflake,
  warm: Sun,
  hot: Flame
};

const temperatureColors = {
  cold: 'text-temperature-cold bg-temperature-cold/10',
  warm: 'text-temperature-warm bg-temperature-warm/10',
  hot: 'text-temperature-hot bg-temperature-hot/10'
};

const temperatureLabels = {
  cold: 'Frio',
  warm: 'Morno',
  hot: 'Quente'
};

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = mockLeads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Leads</h1>
          <p className="text-muted-foreground">
            Gerencie e qualifique seus leads
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Lead
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>
      </Card>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLeads.map((lead) => {
          const TempIcon = temperatureIcons[lead.temperature];
          const tempColor = temperatureColors[lead.temperature];
          const tempLabel = temperatureLabels[lead.temperature];

          return (
            <Card key={lead.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{lead.name}</h3>
                    <Badge variant="outline" className={tempColor}>
                      <TempIcon className="w-3 h-3 mr-1" />
                      {tempLabel}
                    </Badge>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    {lead.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {lead.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {lead.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {lead.interest}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Último contato: {lead.lastContact}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Orçamento</p>
                  <p className="font-semibold text-primary">{lead.budget}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Origem</p>
                  <p className="font-medium text-sm">{lead.source}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
