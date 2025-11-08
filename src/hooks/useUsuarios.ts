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
        .select(`
          *,
          user_roles!user_roles_user_id_fkey(role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform to include role from user_roles table
      return (data || []).map(usuario => ({
        ...usuario,
        role: usuario.user_roles?.[0]?.role || 'assistente'
      })) as Usuario[];
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
        .select(`
          *,
          user_roles!user_roles_user_id_fkey(role)
        `)
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
              nome_completo: user.email?.split('@')[0] || 'Usuário',
              ativo: true,
            })
            .select(`
              *,
              user_roles!user_roles_user_id_fkey(role)
            `)
            .single();
          
          if (insertError) throw insertError;
          
          return {
            ...newUser,
            role: newUser.user_roles?.[0]?.role || 'assistente'
          } as Usuario;
        }
      }

      if (error) throw error;
      
      return data ? {
        ...data,
        role: data.user_roles?.[0]?.role || 'assistente'
      } as Usuario : null;
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

export function useUpdateUsuarioRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: 'admin' | 'corretor' | 'assistente' | 'supervisor';
    }) => {
      // Get auth_user_id from usuarios
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('auth_user_id')
        .eq('id', userId)
        .single();

      if (!usuario?.auth_user_id) throw new Error('Usuário não encontrado');

      // Delete existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', usuario.auth_user_id);

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: usuario.auth_user_id, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuario'] });
      toast.success('Função atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar função');
    },
  });
}

export function useActivateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: 'admin' | 'corretor' | 'assistente' | 'supervisor';
    }) => {
      // Get auth_user_id from usuarios
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('auth_user_id')
        .eq('id', userId)
        .single();

      if (!usuario?.auth_user_id) throw new Error('Usuário não encontrado');

      // Activate user
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ 
          ativo: true,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Delete existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', usuario.auth_user_id);

      // Insert new role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: usuario.auth_user_id, role });

      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Membro adicionado à equipe com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar membro à equipe');
    },
  });
}
