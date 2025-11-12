import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export function LeadsEvolutionChart() {
  const { data: evolutionData, isLoading } = useQuery({
    queryKey: ['leads-evolution'],
    queryFn: async () => {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const { data: leads, error } = await supabase
        .from('leads')
        .select('created_at, temperatura')
        .gte('created_at', last30Days.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Agrupar por dia e temperatura
      const groupedByDay: Record<string, { hot: number; warm: number; cold: number; total: number }> = {};
      
      leads?.forEach(lead => {
        const date = new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (!groupedByDay[date]) {
          groupedByDay[date] = { hot: 0, warm: 0, cold: 0, total: 0 };
        }
        groupedByDay[date][lead.temperatura]++;
        groupedByDay[date].total++;
      });

      return Object.entries(groupedByDay).map(([date, counts]) => ({
        name: date,
        'Quentes': counts.hot,
        'Mornos': counts.warm,
        'Frios': counts.cold,
        'Total': counts.total,
      }));
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[400px]" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Evolução de Leads - Últimos 30 Dias</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={evolutionData || []}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="Total" stroke="hsl(var(--primary))" strokeWidth={3} />
          <Line type="monotone" dataKey="Quentes" stroke="hsl(var(--destructive))" strokeWidth={2} />
          <Line type="monotone" dataKey="Mornos" stroke="hsl(var(--warning))" strokeWidth={2} />
          <Line type="monotone" dataKey="Frios" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
