import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Lead } from '@/types/database.types';

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('finalizado', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });
}

