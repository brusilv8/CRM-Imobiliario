# Instruções para Configurar Google Calendar Integration

## 1. Execute a Migration SQL

No dashboard do Supabase:
1. Vá em **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `add_google_calendar_integration.sql`
4. Execute a query

## 2. Configure Google Cloud Console

### 2.1 Criar Projeto no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Calendar API**:
   - Vá em **APIs & Services** > **Library**
   - Procure por "Google Calendar API"
   - Clique em **Enable**

### 2.2 Configurar OAuth Consent Screen

1. Vá em **APIs & Services** > **OAuth consent screen**
2. Escolha **External** e clique em **Create**
3. Preencha as informações obrigatórias:
   - **App name**: Nome do seu CRM
   - **User support email**: Seu email
   - **Developer contact information**: Seu email
4. Em **Scopes**, adicione:
   - `.../auth/calendar`
   - `.../auth/calendar.events`
5. Salve e continue

### 2.3 Criar Credenciais OAuth 2.0

1. Vá em **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **OAuth Client ID**
3. Escolha **Web application**
4. Configure:
   - **Name**: "CRM Google Calendar Integration"
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (desenvolvimento)
     - `https://seu-dominio.lovableproject.com` (produção)
   - **Authorized redirect URIs**:
     - `http://localhost:5173/api/google-calendar-callback`
     - `https://seu-dominio.lovableproject.com/api/google-calendar-callback`
5. Clique em **Create**
6. **Copie o Client ID e Client Secret** - você vai precisar deles!

## 3. Configurar Secrets no Lovable

Os secrets `GOOGLE_CALENDAR_CLIENT_ID` e `GOOGLE_CALENDAR_CLIENT_SECRET` já foram adicionados.

Se precisar atualizar:
1. Vá nas configurações do projeto Lovable
2. Acesse a seção de Secrets
3. Atualize os valores com as credenciais do Google Cloud Console

## 4. Como Funciona a Integração

### Fluxo de Autenticação
1. Usuário clica em "Conectar Google Calendar" na aba Agenda
2. É redirecionado para o Google para autorizar o acesso
3. Após autorizar, os tokens são salvos no banco de dados
4. Um webhook é configurado para receber notificações do Google

### Sincronização Automática

**Do CRM para o Google Calendar:**
- Quando uma visita é criada/atualizada/deletada no CRM
- A edge function `google-calendar-sync` é chamada automaticamente
- O evento é sincronizado com o Google Calendar do usuário

**Do Google Calendar para o CRM:**
- Quando um evento é alterado no Google Calendar
- O Google envia uma notificação via webhook
- A edge function `google-calendar-webhook` processa a mudança
- A visita correspondente é atualizada no CRM

### Dados Sincronizados
- Título (Lead + Imóvel)
- Data e hora
- Duração
- Descrição (detalhes do lead e imóvel)
- Status (agendada/cancelada)

## 5. Testes

Para testar a integração:

1. **Conectar Google Calendar**:
   - Acesse a aba Agenda
   - Clique em "Conectar Google Calendar"
   - Autorize o acesso

2. **Criar uma visita no CRM**:
   - Agende uma nova visita
   - Verifique se aparece no seu Google Calendar

3. **Editar uma visita no CRM**:
   - Altere a data/hora de uma visita
   - Confirme que o Google Calendar foi atualizado

4. **Editar um evento no Google Calendar**:
   - Altere a data de um evento sincronizado
   - Aguarde alguns minutos
   - Verifique se a visita no CRM foi atualizada

## 6. Troubleshooting

### Erro: "Google Calendar not connected"
- Verifique se o usuário conectou o Google Calendar
- Reautentique clicando em "Desconectar Google" e depois "Conectar Google Calendar"

### Eventos não sincronizam
- Verifique os logs das edge functions no Supabase
- Confirme que os secrets estão configurados corretamente
- Verifique se o webhook do Google ainda está ativo

### Token expirado
- Os tokens são renovados automaticamente
- Se houver erro, desconecte e reconecte o Google Calendar

## 7. Segurança

- ✅ Tokens OAuth2 são armazenados criptografados
- ✅ RLS (Row Level Security) garante que cada usuário acessa apenas seus próprios dados
- ✅ Refresh tokens permitem acesso contínuo sem re-autenticação
- ✅ Webhooks do Google usam assinatura para validar origem

## 8. Limitações

- O webhook do Google Calendar expira após ~7 dias e precisa ser renovado
- A sincronização do Google → CRM pode ter alguns minutos de atraso
- Apenas o calendário principal (primary) é sincronizado

## Suporte

Se encontrar problemas:
1. Verifique os logs no Supabase Edge Functions
2. Confirme que todas as credenciais estão corretas
3. Teste a conexão OAuth2 manualmente
