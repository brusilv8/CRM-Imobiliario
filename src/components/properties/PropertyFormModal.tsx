import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useCreateImovel } from "@/hooks/useImoveis";
import InputMask from "react-input-mask";

const propertySchema = z.object({
  tipo: z.string().min(1, "Tipo é obrigatório"),
  finalidade: z.enum(["venda", "aluguel"]),
  cep: z.string().min(8, "CEP inválido"),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório"),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  valor_venda: z.number().optional(),
  valor_aluguel: z.number().optional(),
  valor_condominio: z.number().optional(),
  valor_iptu: z.number().optional(),
  quartos: z.number().optional(),
  banheiros: z.number().optional(),
  vagas: z.number().optional(),
  area_total: z.number().optional(),
  area_util: z.number().optional(),
  descricao: z.string().optional(),
  status: z.enum(["disponivel", "reservado", "vendido", "alugado"]),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyFormModal({ open, onOpenChange }: PropertyFormModalProps) {
  const [step, setStep] = useState(1);
  const createImovel = useCreateImovel();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      finalidade: "venda",
      status: "disponivel",
    },
  });

  const finalidade = watch("finalidade");
  const cep = watch("cep");

  const fetchAddressByCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setValue("endereco", data.logradouro);
          setValue("bairro", data.bairro);
          setValue("cidade", data.localidade);
          setValue("estado", data.uf);
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    // Ensure required fields are present
    if (!data.tipo || !data.finalidade || !data.cep || !data.endereco || 
        !data.cidade || !data.estado || !data.bairro || !data.status) {
      return;
    }
    
    await createImovel.mutateAsync(data as any);
    reset();
    setStep(1);
    onOpenChange(false);
  };

  const handleClose = () => {
    reset();
    setStep(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Imóvel</DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? 'w-12 bg-primary' : s < step ? 'w-8 bg-primary/50' : 'w-8 bg-muted'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Dados Básicos */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select onValueChange={(value) => setValue("tipo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartamento">Apartamento</SelectItem>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Cobertura">Cobertura</SelectItem>
                      <SelectItem value="Terreno">Terreno</SelectItem>
                      <SelectItem value="Comercial">Comercial</SelectItem>
                      <SelectItem value="Galpão">Galpão</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tipo && <p className="text-sm text-destructive">{errors.tipo.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Finalidade *</Label>
                  <RadioGroup
                    value={finalidade}
                    onValueChange={(value: "venda" | "aluguel") => setValue("finalidade", value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="venda" id="venda" />
                      <Label htmlFor="venda">Venda</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="aluguel" id="aluguel" />
                      <Label htmlFor="aluguel">Aluguel</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CEP *</Label>
                  <InputMask
                    mask="99999-999"
                    value={cep}
                    onChange={(e) => {
                      setValue("cep", e.target.value);
                      fetchAddressByCEP(e.target.value);
                    }}
                  >
                    {(inputProps: any) => <Input {...inputProps} placeholder="00000-000" />}
                  </InputMask>
                  {errors.cep && <p className="text-sm text-destructive">{errors.cep.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Input {...register("estado")} placeholder="UF" maxLength={2} />
                  {errors.estado && <p className="text-sm text-destructive">{errors.estado.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Endereço *</Label>
                <Input {...register("endereco")} placeholder="Rua, Avenida..." />
                {errors.endereco && <p className="text-sm text-destructive">{errors.endereco.message}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input {...register("numero")} placeholder="123" />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Complemento</Label>
                  <Input {...register("complemento")} placeholder="Apto 101, Bloco A..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bairro *</Label>
                  <Input {...register("bairro")} placeholder="Bairro" />
                  {errors.bairro && <p className="text-sm text-destructive">{errors.bairro.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Cidade *</Label>
                  <Input {...register("cidade")} placeholder="Cidade" />
                  {errors.cidade && <p className="text-sm text-destructive">{errors.cidade.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{finalidade === "venda" ? "Valor de Venda" : "Valor do Aluguel"}</Label>
                  <Input
                    type="number"
                    {...register(finalidade === "venda" ? "valor_venda" : "valor_aluguel", {
                      valueAsNumber: true,
                    })}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Condomínio</Label>
                  <Input
                    type="number"
                    {...register("valor_condominio", { valueAsNumber: true })}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Características */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Quartos</Label>
                  <Input
                    type="number"
                    {...register("quartos", { valueAsNumber: true })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Banheiros</Label>
                  <Input
                    type="number"
                    {...register("banheiros", { valueAsNumber: true })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Vagas</Label>
                  <Input
                    type="number"
                    {...register("vagas", { valueAsNumber: true })}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>IPTU</Label>
                  <Input
                    type="number"
                    {...register("valor_iptu", { valueAsNumber: true })}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Área Total (m²)</Label>
                  <Input
                    type="number"
                    {...register("area_total", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Área Útil (m²)</Label>
                  <Input
                    type="number"
                    {...register("area_util", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  {...register("descricao")}
                  placeholder="Descreva as características do imóvel..."
                  rows={6}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirmação */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-6 space-y-3">
                <h4 className="font-semibold text-lg">Confirme os dados</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <p className="font-medium">{watch("tipo")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Finalidade:</span>
                    <p className="font-medium">{watch("finalidade") === "venda" ? "Venda" : "Aluguel"}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Endereço:</span>
                    <p className="font-medium">
                      {watch("endereco")}, {watch("numero")} - {watch("bairro")}
                    </p>
                    <p className="font-medium">
                      {watch("cidade")} - {watch("estado")}, {watch("cep")}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor:</span>
                    <p className="font-medium">
                      R$ {(watch(finalidade === "venda" ? "valor_venda" : "valor_aluguel") || 0).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Características:</span>
                    <p className="font-medium">
                      {watch("quartos") || 0} quartos, {watch("banheiros") || 0} banheiros, {watch("vagas") || 0} vagas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            )}

            {step < 3 ? (
              <Button type="button" onClick={() => setStep(step + 1)}>
                Próximo
              </Button>
            ) : (
              <Button type="submit" disabled={createImovel.isPending}>
                {createImovel.isPending ? "Cadastrando..." : "Cadastrar Imóvel"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
