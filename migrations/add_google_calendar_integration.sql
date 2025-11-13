-- Tabela para armazenar tokens OAuth2 do Google Calendar
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMPTZ NOT NULL,
  calendar_id TEXT,
  webhook_channel_id TEXT,
  webhook_resource_id TEXT,
  webhook_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabela para mapear eventos entre CRM e Google Calendar
CREATE TABLE IF NOT EXISTS visitas_google_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE NOT NULL,
  google_event_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(visita_id, user_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_google_calendar_tokens_user ON google_calendar_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_visitas_google_sync_visita ON visitas_google_sync(visita_id);
CREATE INDEX IF NOT EXISTS idx_visitas_google_sync_user ON visitas_google_sync(user_id);

-- RLS Policies
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas_google_sync ENABLE ROW LEVEL SECURITY;

-- Políticas para google_calendar_tokens
CREATE POLICY "Users can view their own tokens"
  ON google_calendar_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
  ON google_calendar_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
  ON google_calendar_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens"
  ON google_calendar_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para visitas_google_sync
CREATE POLICY "Users can view their own sync records"
  ON visitas_google_sync FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync records"
  ON visitas_google_sync FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync records"
  ON visitas_google_sync FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sync records"
  ON visitas_google_sync FOR DELETE
  USING (auth.uid() = user_id);
