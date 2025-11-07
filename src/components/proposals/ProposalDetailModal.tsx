import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, User, Home, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import type { Proposta } from '@/types/database.types';

interface ProposalDetailModalProps {
  proposal: Proposta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  enviada: { label: 'Enviada', variant: 'default' as const, color: 'bg-blue-500' },
  em_analise: { label: 'Em Análise', variant: 'secondary' as const, color: 'bg-yellow-500' },
  aprovada: { label: 'Aprovada', variant: 'default' as const, color: 'bg-green-500' },
  recusada: { label: 'Recusada', variant: 'destructive' as const, color: 'bg-red-500' },
};

export function ProposalDetailModal({ proposal, open, onOpenChange }: ProposalDetailModalProps) {
  const statusInfo = statusConfig[proposal.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Proposta {proposal.codigo}
            </DialogTitle>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Lead</p>
                    <p className="font-semibold">{proposal.lead?.nome}</p>
                    <p className="text-sm">{proposal.lead?.telefone}</p>
                    {proposal.lead?.email && <p className="text-sm">{proposal.lead.email}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Imóvel</p>
                    <p className="font-semibold">{proposal.imovel?.tipo}</p>
                    <p className="text-sm">{proposal.imovel?.endereco}</p>
                    <p className="text-sm">
                      {proposal.imovel?.cidade} - {proposal.imovel?.estado}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Valor da Proposta</p>
                    <p className="text-2xl font-bold text-primary">
                      {proposal.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Validade</p>
                    <p className="font-semibold">
                      {format(new Date(proposal.validade), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Condições Financeiras</h4>
              <div className="grid grid-cols-3 gap-4">
                {proposal.valor_entrada && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Entrada</p>
                    <p className="font-semibold">
                      {proposal.valor_entrada.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                )}

                {proposal.num_parcelas && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Parcelas</p>
                    <p className="font-semibold">{proposal.num_parcelas}x</p>
                  </div>
                )}

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">FGTS</p>
                  <p className="font-semibold">{proposal.usa_fgts ? 'Sim' : 'Não'}</p>
                </div>
              </div>
            </div>

            {proposal.condicoes_especiais && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Condições Especiais</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {proposal.condicoes_especiais}
                  </p>
                </div>
              </>
            )}

            <Separator />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Criada em {format(new Date(proposal.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', statusInfo.color)}>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-0.5 h-full bg-border mt-2"></div>
                </div>
                <div className="flex-1 pb-8">
                  <p className="font-semibold">Proposta Criada</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(proposal.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  <p className="text-sm mt-1">
                    Proposta {proposal.codigo} criada no valor de{' '}
                    {proposal.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>

              {proposal.updated_at && proposal.updated_at !== proposal.created_at && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', statusInfo.color)}>
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Status Atualizado</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(proposal.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <p className="text-sm mt-1">
                      Status alterado para <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
