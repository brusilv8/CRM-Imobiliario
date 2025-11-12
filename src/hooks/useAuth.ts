import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Login realizado com sucesso!');
      return { error: null };
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
      return { error };
    }
  };

  const signUp = async (email: string, password: string, nome: string) => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome_completo: nome,
            email: email
          }
        }
      });

      if (error) throw error;

      // O perfil será criado automaticamente pelo trigger do Supabase
      // após a confirmação do email
      
      if (data?.user?.identities?.length === 0) {
        toast.error('Este email já está cadastrado');
        return { error: new Error('Email já cadastrado') };
      }

      toast.success('Cadastro realizado! Verifique seu email para confirmar.');
      return { error: null };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      // Tratamento de erros específicos
      if (error.message?.includes('already registered')) {
        toast.error('Este email já está cadastrado');
      } else if (error.message?.includes('Invalid email')) {
        toast.error('Email inválido');
      } else if (error.message?.includes('Password')) {
        toast.error('Senha muito fraca. Use no mínimo 6 caracteres');
      } else {
        toast.error(error.message || 'Erro ao cadastrar. Tente novamente.');
      }
      
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Logout realizado com sucesso!');
      return { error: null };
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer logout');
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
