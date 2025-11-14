# Instruções para Corrigir o Erro de Status de Propostas

## Problema
Ao tentar alterar o status de uma proposta para "Em Análise", ocorre o erro:
```
new row for relation "propostas" violates check constraint "propostas_status_check"
```

## Causa
A constraint no banco de dados não permite o valor `'em_analise'`. A constraint precisa ser atualizada para aceitar os valores corretos.

## Solução

### Passo 1: Acessar o Supabase SQL Editor
1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral

### Passo 2: Executar o Script
1. Abra o arquivo `fix_propostas_status.sql` na raiz do projeto
2. Copie todo o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** ou pressione `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Passo 3: Verificar
Após executar o script, tente alterar o status de uma proposta novamente. O erro não deve mais ocorrer.

## O que o script faz?
1. Atualiza registros existentes para usar o formato snake_case
2. Remove a constraint antiga
3. Adiciona uma nova constraint que aceita: `'pendente'`, `'em_analise'`, `'aceita'`, `'recusada'`, `'cancelada'`
4. Define o valor padrão como `'pendente'`

## Nota
Este script é seguro e não apaga dados. Ele apenas atualiza a estrutura da tabela para aceitar os valores corretos de status.

