# Configuração de Cadastro e Email de Verificação

## 1. Execute a Migration do Trigger

Execute o arquivo `create_usuarios_trigger.sql` no seu projeto Supabase:

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `migrations/create_usuarios_trigger.sql`
4. Execute a query

Este trigger irá criar automaticamente um registro na tabela `usuarios` sempre que um novo usuário se cadastrar via Auth.

## 2. Configuração de Email no Supabase

### Verificar se o envio de email está ativo:

1. Acesse **Authentication** → **Email Templates** no dashboard
2. Verifique se o template "Confirm signup" está habilitado
3. Personalize a mensagem se desejar

### Para ambiente de produção (SMTP customizado):

1. Acesse **Project Settings** → **Auth** → **SMTP Settings**
2. Configure seu provedor de email (recomendado: Resend, SendGrid, ou AWS SES)
3. Preencha:
   - Host SMTP
   - Porta
   - Usuário/Senha
   - Email remetente

### Para testes (email provider do Supabase):

O Supabase envia emails automaticamente em desenvolvimento, mas tem limite de 3 emails/hora.

## 3. Configurar URLs de Redirect

1. Acesse **Authentication** → **URL Configuration**
2. Configure:
   - **Site URL**: URL da sua aplicação (ex: `https://seu-app.lovable.app`)
   - **Redirect URLs**: Adicione todas as URLs onde sua aplicação pode rodar:
     - `https://seu-app.lovable.app/*`
     - `http://localhost:5173/*` (para desenvolvimento local)

## 4. Opcional: Desabilitar confirmação de email para testes

⚠️ **Apenas para ambiente de desenvolvimento/testes**

1. Acesse **Authentication** → **Providers** → **Email**
2. Desmarque "Confirm email"
3. Isso permite login imediato sem confirmar email (não recomendado em produção)

## 5. Testar o Cadastro

Após configurar tudo:

1. Tente cadastrar um novo usuário
2. Verifique o email de confirmação
3. Clique no link de confirmação
4. O usuário será criado automaticamente na tabela `usuarios` via trigger
5. Faça login normalmente

## Tratamento de Erros

O sistema agora trata os seguintes erros:

- ✅ Email já cadastrado
- ✅ Email inválido
- ✅ Senha muito curta (mínimo 6 caracteres)
- ✅ Erros de conexão com Supabase

## Suporte

Se o email não chegar:

1. Verifique spam/lixeira
2. Confirme configuração SMTP no Supabase
3. Verifique logs em **Authentication** → **Logs**
4. Para testes, considere desabilitar confirmação de email temporariamente
