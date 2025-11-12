import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export function VisitsChart() {
  const { data: visitasData, isLoading } = useQuery({
    queryKey: ['visitas-chart'],
    queryFn: async () => {
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      const { data, error } = await supabase
        .from('visitas')
        .select('data_hora, status')
        .gte('data_hora', last7Days.toISOString())
        .order('data_hora', { ascending: true });

      if (error) throw error;

      // Agrupar por dia
      const groupedByDay: Record<string, { agendada: number; realizada: number; cancelada: number }> = {};
      
      data?.forEach(visita => {
        const date = new Date(visita.data_hora).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (!groupedByDay[date]) {
          groupedByDay[date] = { agendada: 0, realizada: 0, cancelada: 0 };
        }
        groupedByDay[date][visita.status]++;
      });

      return Object.entries(groupedByDay).map(([date, counts]) => ({
        name: date,
        agendada: counts.agendada,
        realizada: counts.realizada,
        cancelada: counts.cancelada,
      }));
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[350px]" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Visitas - Últimos 7 Dias</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={visitasData || []}>
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
          <Line type="monotone" dataKey="agendada" stroke="hsl(var(--warning))" strokeWidth={2} />
          <Line type="monotone" dataKey="realizada" stroke="hsl(var(--secondary))" strokeWidth={2} />
          <Line type="monotone" dataKey="cancelada" stroke="hsl(var(--destructive))" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
