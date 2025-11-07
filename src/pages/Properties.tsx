import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Square,
  Eye
} from "lucide-react";

interface Property {
  id: string;
  title: string;
  type: string;
  address: string;
  price: string;
  status: 'available' | 'reserved' | 'sold';
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: number;
  image: string;
  views: number;
}

const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Apartamento Moderno no Centro',
    type: 'Apartamento',
    address: 'Centro, São Paulo - SP',
    price: 'R$ 580.000',
    status: 'available',
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    area: 95,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
    views: 245
  },
  {
    id: '2',
    title: 'Casa em Condomínio Fechado',
    type: 'Casa',
    address: 'Bairro Alto, São Paulo - SP',
    price: 'R$ 1.200.000',
    status: 'available',
    bedrooms: 4,
    bathrooms: 3,
    parking: 3,
    area: 280,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500',
    views: 189
  },
  {
    id: '3',
    title: 'Cobertura Duplex Vista Mar',
    type: 'Cobertura',
    address: 'Zona Sul, São Paulo - SP',
    price: 'R$ 2.500.000',
    status: 'reserved',
    bedrooms: 5,
    bathrooms: 4,
    parking: 4,
    area: 380,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500',
    views: 456
  },
  {
    id: '4',
    title: 'Apartamento Compacto',
    type: 'Apartamento',
    address: 'Vila Madalena, São Paulo - SP',
    price: 'R$ 380.000',
    status: 'available',
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    area: 55,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
    views: 312
  }
];

const statusLabels = {
  available: 'Disponível',
  reserved: 'Reservado',
  sold: 'Vendido'
};

const statusColors = {
  available: 'bg-secondary/10 text-secondary',
  reserved: 'bg-warning/10 text-warning',
  sold: 'bg-muted text-muted-foreground'
};

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProperties = mockProperties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Catálogo de Imóveis</h1>
          <p className="text-muted-foreground">
            Gerencie seu portfólio de imóveis
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Imóvel
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, endereço ou tipo..."
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

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="relative h-48 bg-muted">
              <img 
                src={property.image} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <Badge className={`absolute top-4 right-4 ${statusColors[property.status]}`}>
                {statusLabels[property.status]}
              </Badge>
            </div>
            
            <div className="p-6">
              <div className="mb-3">
                <Badge variant="outline" className="mb-2">
                  {property.type}
                </Badge>
                <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {property.address}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
                <div className="flex flex-col items-center p-2 bg-muted rounded-lg">
                  <BedDouble className="w-4 h-4 mb-1 text-muted-foreground" />
                  <span className="font-medium">{property.bedrooms}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-muted rounded-lg">
                  <Bath className="w-4 h-4 mb-1 text-muted-foreground" />
                  <span className="font-medium">{property.bathrooms}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-muted rounded-lg">
                  <Car className="w-4 h-4 mb-1 text-muted-foreground" />
                  <span className="font-medium">{property.parking}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-muted rounded-lg">
                  <Square className="w-4 h-4 mb-1 text-muted-foreground" />
                  <span className="font-medium">{property.area}m²</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="font-bold text-xl text-primary">{property.price}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  {property.views}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
