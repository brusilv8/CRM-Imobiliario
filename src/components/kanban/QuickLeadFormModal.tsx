import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, Sun, Snowflake } from "lucide-react";
import { useCreateLead } from "@/hooks/useLeads";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

interface QuickLeadFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const leadSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  telefone: z.string().trim().min(10, "Telefone inválido").max(20, "Telefone muito longo"),
  temperatura: z.enum(['cold', 'warm', 'hot']),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
  origem: z.string().trim().min(1, "Origem é obrigatória").max(50),
});

export function QuickLeadFormModal({ open, onOpenChange }: QuickLeadFormModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    temperatura: "warm" as "cold" | "warm" | "hot",
    observacoes: "",
    origem: "site",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const createLead = useCreateLead();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = leadSchema.parse(formData);
      
      await createLead.mutateAsync({
        nome: validated.nome,
        telefone: validated.telefone,
        temperatura: validated.temperatura,
        origem: validated.origem,
        observacoes: validated.observacoes || undefined,
      });
      
      toast({
        title: "Lead criado!",
        description: "Novo atendimento cadastrado com sucesso.",
      });
      
      setFormData({
        nome: "",
        telefone: "",
        temperatura: "warm",
        observacoes: "",
        origem: "site",
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar o lead. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Novo Atendimento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome completo do cliente"
              className={errors.nome ? "border-destructive" : ""}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              placeholder="(00) 00000-0000"
              className={errors.telefone ? "border-destructive" : ""}
            />
            {errors.telefone && (
              <p className="text-sm text-destructive">{errors.telefone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="origem">Origem *</Label>
            <Select
              value={formData.origem}
              onValueChange={(value) => setFormData({ ...formData, origem: value })}
            >
              <SelectTrigger id="origem" className={errors.origem ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione a origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="site">Site</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="telefone">Telefone</SelectItem>
                <SelectItem value="indicacao">Indicação</SelectItem>
                <SelectItem value="redes_sociais">Redes Sociais</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
            {errors.origem && (
              <p className="text-sm text-destructive">{errors.origem}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Temperatura do Lead *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.temperatura === 'cold' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, temperatura: 'cold' })}
                className="flex-1 gap-2"
              >
                <Snowflake className="w-4 h-4" />
                Frio
              </Button>
              <Button
                type="button"
                variant={formData.temperatura === 'warm' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, temperatura: 'warm' })}
                className="flex-1 gap-2"
              >
                <Sun className="w-4 h-4" />
                Morno
              </Button>
              <Button
                type="button"
                variant={formData.temperatura === 'hot' ? 'destructive' : 'outline'}
                onClick={() => setFormData({ ...formData, temperatura: 'hot' })}
                className="flex-1 gap-2"
              >
                <Flame className="w-4 h-4" />
                Quente
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Anotações sobre o atendimento..."
              rows={3}
              className={errors.observacoes ? "border-destructive" : ""}
            />
            {errors.observacoes && (
              <p className="text-sm text-destructive">{errors.observacoes}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createLead.isPending}
              className="flex-1"
            >
              {createLead.isPending ? "Criando..." : "Criar Atendimento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
