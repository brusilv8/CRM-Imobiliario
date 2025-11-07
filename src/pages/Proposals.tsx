import { useState } from 'react';
import { usePropostas } from '@/hooks/usePropostas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Eye } from 'lucide-react';
import { ProposalFormModal } from '@/components/proposals/ProposalFormModal';
import { ProposalDetailModal } from '@/components/proposals/ProposalDetailModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Proposta } from '@/types/database.types';

const statusConfig = {
  enviada: { label: 'Enviada', variant: 'default' as const },
  em_analise: { label: 'Em Análise', variant: 'secondary' as const },
  aprovada: { label: 'Aprovada', variant: 'default' as const },
  recusada: { label: 'Recusada', variant: 'destructive' as const },
};

export default function Proposals() {
  const { data: propostas, isLoading } = usePropostas();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProposta, setSelectedProposta] = useState<Proposta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPropostas = propostas?.filter((proposta) => {
    const matchesSearch =
      proposta.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposta.lead?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proposta.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Propostas</h1>
          <p className="text-muted-foreground">Gerencie suas propostas comerciais</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Proposta
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por código ou lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="enviada">Enviada</SelectItem>
              <SelectItem value="em_analise">Em Análise</SelectItem>
              <SelectItem value="aprovada">Aprovada</SelectItem>
              <SelectItem value="recusada">Recusada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Imóvel</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPropostas && filteredPropostas.length > 0 ? (
                filteredPropostas.map((proposta) => {
                  const statusInfo = statusConfig[proposta.status];
                  return (
                    <TableRow key={proposta.id}>
                      <TableCell className="font-medium">{proposta.codigo}</TableCell>
                      <TableCell>{proposta.lead?.nome}</TableCell>
                      <TableCell>
                        {proposta.imovel?.tipo} - {proposta.imovel?.endereco}
                      </TableCell>
                      <TableCell>
                        {proposta.valor.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(proposta.validade), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProposta(proposta)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma proposta encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ProposalFormModal open={isFormOpen} onOpenChange={setIsFormOpen} />

      {selectedProposta && (
        <ProposalDetailModal
          proposal={selectedProposta}
          open={!!selectedProposta}
          onOpenChange={() => setSelectedProposta(null)}
        />
      )}
    </div>
  );
}
