-- Remove trigger e função antigos se existirem
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Cria função para criar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (auth_id, nome_completo, email, ativo)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome_completo', new.email),
    new.email,
    true
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log do erro mas não bloqueia o signup
    RAISE WARNING 'Erro ao criar perfil do usuário: %', SQLERRM;
    RETURN new;
END;
$$;

-- Cria trigger que executa após confirmação do email
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (new.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- Também cria trigger para quando o email for confirmado posteriormente
CREATE OR REPLACE FUNCTION public.handle_email_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Verifica se o perfil já existe
  IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE auth_id = new.id) THEN
    INSERT INTO public.usuarios (auth_id, nome_completo, email, ativo)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'nome_completo', new.email),
      new.email,
      true
    );
  END IF;
  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Erro ao criar perfil do usuário: %', SQLERRM;
    RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (old.email_confirmed_at IS NULL AND new.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_email_confirmed();
