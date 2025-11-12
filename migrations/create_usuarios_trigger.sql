-- Função que cria automaticamente um perfil na tabela usuarios quando um usuário se cadastra via Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.usuarios (auth_id, nome_completo, email, ativo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    true
  );
  return new;
end;
$$;

-- Trigger que executa a função sempre que um novo usuário é criado no Auth
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
