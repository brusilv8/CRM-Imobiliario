# Como Fazer Deploy das Edge Functions

## O que aconteceu?

As edge functions foram criadas no código, mas precisam ser deployadas no Supabase para funcionarem.

## Opção 1: Deploy Automático (Recomendado)

As edge functions serão deployadas automaticamente quando o projeto Lovable for publicado/deployado.

**Passos:**
1. Publique seu projeto Lovable
2. Aguarde o deploy completar
3. As edge functions estarão disponíveis automaticamente

## Opção 2: Deploy Manual via Supabase CLI

Se você tem acesso ao Supabase CLI e quer fazer deploy manualmente:

### 1. Instale o Supabase CLI
```bash
npm install -g supabase
```

### 2. Faça Login
```bash
supabase login
```

### 3. Link o Projeto
```bash
supabase link --project-ref bqywfqehoziqxbobqxyl
```

### 4. Deploy das Functions
```bash
supabase functions deploy google-calendar-auth
supabase functions deploy google-calendar-callback
supabase functions deploy google-calendar-sync
supabase functions deploy google-calendar-webhook
```

### 5. Configure as Secrets
```bash
supabase secrets set GOOGLE_CALENDAR_CLIENT_ID=seu_client_id_aqui
supabase secrets set GOOGLE_CALENDAR_CLIENT_SECRET=sua_secret_aqui
```

## Opção 3: Deploy via Dashboard Supabase

1. Acesse o Dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em "Edge Functions"
4. Faça upload de cada função manualmente

## Verificando se as Functions Estão Ativas

Após o deploy, você pode testar se as functions estão funcionando:

1. Acesse: `https://bqywfqehoziqxbobqxyl.supabase.co/functions/v1/google-calendar-auth`
2. Se retornar algo (mesmo que um erro de CORS), a function está deployada
3. Se retornar 404, a function ainda não foi deployada

## Próximos Passos

Depois que as edge functions estiverem deployadas:
1. Volte para a página /calendar
2. Clique em "Conectar Google Calendar"
3. A integração funcionará normalmente

## Precisa de Ajuda?

Se ainda estiver com problemas após o deploy, verifique:
- As secrets estão configuradas no Supabase (GOOGLE_CALENDAR_CLIENT_ID e GOOGLE_CALENDAR_CLIENT_SECRET)
- As credenciais do Google Cloud Console estão corretas
- Os URIs de redirecionamento estão configurados corretamente no Google Cloud Console
