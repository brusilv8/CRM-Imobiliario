import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Usuario } from '@/types/database.types';
import { toast } from 'sonner';

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Usuario[];
    },
  });
}

export function useUsuario(userId?: string) {
  return useQuery({
    queryKey: ['usuario', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();

      // Se não encontrar usuário, tentar criar
      if (!data && !error) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: newUser, error: insertError } = await supabase
            .from('usuarios')
            .insert({
              auth_user_id: user.id,
              email: user.email,
              nome: user.email?.split('@')[0] || 'Usuário',
              ativo: true,
            })
            .select()
            .single();
          
          if (insertError) throw insertError;
          return newUser as Usuario;
        }
      }

      if (error) throw error;
      return data as Usuario;
    },
    enabled: !!userId,
  });
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Usuario> & { id: string }) => {
      const { data, error } = await supabase
        .from('usuarios')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Usuario;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuario'] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar perfil');
    },
  });
}

export function useInviteUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      nome: string;
      role: 'admin' | 'corretor' | 'assistente';
      telefone?: string;
      cargo?: string;
    }) => {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
        user_metadata: {
          nome: data.nome,
        },
      });

      if (authError) throw authError;

      // Create user profile
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert({
          auth_id: authData.user.id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          cargo: data.cargo,
          ativo: true,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: data.role,
        });

      if (roleError) throw roleError;

      return userData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Convite enviado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao enviar convite');
    },
  });
}

export function useUpdateUsuarioRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: 'admin' | 'corretor' | 'assistente';
    }) => {
      // Delete existing role
      await supabase.from('user_roles').delete().eq('user_id', userId);

      // Insert new role
      const { error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Função atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar função');
    },
  });
}
