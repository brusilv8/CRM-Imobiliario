# Instruções de Configuração - Integração Google Calendar

## 1. Execute a Migration SQL

Execute o arquivo `add_google_calendar_integration.sql` no SQL Editor do Supabase para criar as tabelas necessárias.

## 2. Configure o Google Cloud Console

### 2.1. Crie um Projeto no Google Cloud Console
1. Acesse https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente

### 2.2. Ative a Google Calendar API
1. No menu lateral, vá em "APIs e Serviços" > "Biblioteca"
2. Pesquise por "Google Calendar API"
3. Clique em "Ativar"

### 2.3. Configure a Tela de Consentimento OAuth
1. Vá em "APIs e Serviços" > "Tela de consentimento OAuth"
2. Escolha "Externo" e clique em "Criar"
3. Preencha:
   - Nome do app: "CRM Lovable"
   - E-mail de suporte: seu e-mail
   - Domínio autorizado: `lovableproject.com` (ou seu domínio customizado)
   - E-mail do desenvolvedor: seu e-mail
4. Clique em "Salvar e continuar"
5. Em "Escopos", adicione:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
6. Continue e finalize

### 2.4. Crie as Credenciais OAuth 2.0
1. Vá em "APIs e Serviços" > "Credenciais"
2. Clique em "+ CRIAR CREDENCIAIS" > "ID do cliente OAuth"
3. Tipo de aplicativo: "Aplicativo da Web"
4. Nome: "CRM Lovable Calendar Integration"
5. **Origens JavaScript autorizadas**:
   - `https://71fdb8da-d5c0-45c8-956e-f56aa5c95718.lovableproject.com`
   - `http://localhost` (para desenvolvimento local)
6. **URIs de redirecionamento autorizados**:
   - `https://71fdb8da-d5c0-45c8-956e-f56aa5c95718.lovableproject.com/google-calendar-callback`
   - `http://localhost/google-calendar-callback` (para desenvolvimento)
7. Clique em "Criar"
8. **IMPORTANTE**: Copie o "ID do cliente" e a "Chave secreta do cliente"

## 3. Adicione as Secrets no Lovable Cloud

No painel do Lovable Cloud, vá em Settings > Secrets e adicione:
- `GOOGLE_CALENDAR_CLIENT_ID`: Cole o ID do cliente
- `GOOGLE_CALENDAR_CLIENT_SECRET`: Cole a chave secreta

## 4. Teste a Integração

1. Vá para a página "Agenda de Visitas" (/calendar)
2. Clique no botão "Conectar Google Calendar"
3. Uma janela popup abrirá solicitando permissões do Google
4. Autorize o acesso
5. A janela fechará automaticamente e você verá a mensagem "Google Calendar conectado com sucesso!"

## 5. Como Funciona

### Sincronização CRM → Google Calendar
- Quando você cria ou edita uma visita no CRM, ela é automaticamente criada/atualizada no Google Calendar
- O evento incluirá: título, data/hora, duração, descrição e localização

### Sincronização Google Calendar → CRM
- Quando você edita um evento no Google Calendar que foi criado pelo CRM, as alterações são sincronizadas de volta
- O webhook do Google notifica o CRM sobre mudanças
- Campos sincronizados: data/hora, duração e status

## 6. Problemas Comuns

### Erro: "Popup bloqueado"
- Permita popups no seu navegador para este site

### Erro: "redirect_uri_mismatch"
- Verifique se o URI de redirecionamento no Google Cloud Console está EXATAMENTE:
  `https://71fdb8da-d5c0-45c8-956e-f56aa5c95718.lovableproject.com/google-calendar-callback`

### Erro: "invalid_client"
- Verifique se as secrets GOOGLE_CALENDAR_CLIENT_ID e GOOGLE_CALENDAR_CLIENT_SECRET foram adicionadas corretamente no Lovable Cloud

### Eventos não aparecem no Google Calendar
- Verifique os logs das Edge Functions no Lovable Cloud
- Certifique-se de que a Google Calendar API está ativada no seu projeto do Google Cloud

### Eventos do Google não aparecem no CRM
- Verifique se o webhook foi configurado corretamente (você pode ver isso nos logs da edge function `google-calendar-callback`)
- O webhook do Google expira após 7 dias - será necessário reconectar periodicamente
