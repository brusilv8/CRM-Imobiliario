-- Adiciona campos do proprietário na tabela imoveis
ALTER TABLE imoveis 
ADD COLUMN IF NOT EXISTS proprietario_nome VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS proprietario_telefone VARCHAR(20) NOT NULL DEFAULT '';

-- Remove os defaults após adicionar as colunas
ALTER TABLE imoveis 
ALTER COLUMN proprietario_nome DROP DEFAULT,
ALTER COLUMN proprietario_telefone DROP DEFAULT;
