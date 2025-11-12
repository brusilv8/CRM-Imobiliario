# 🔧 Instruções para Configurar Autenticação no Supabase

## ⚠️ IMPORTANTE: Execute estas configurações ANTES de testar o cadastro

---

## 1️⃣ Executar a Migration do Trigger

**Passo 1:** Acesse o Cloud → Database → SQL Editor

**Passo 2:** Cole e execute o conteúdo do arquivo `migrations/fix_usuarios_trigger.sql`

Este trigger criará automaticamente o perfil do usuário na tabela `usuarios` após a confirmação do email.

---

## 2️⃣ Configurar URLs no Supabase

**Acesse:** Cloud → Authentication → URL Configuration

### Site URL
Configure a URL principal da sua aplicação:
- **Desenvolvimento:** `https://[seu-projeto].lovable.app`
- **Produção:** Sua URL customizada (se tiver)

### Redirect URLs
Adicione TODAS estas URLs (uma por linha):
```
https://[seu-projeto].lovable.app/**
http://localhost:5173/**
https://[seu-projeto].lovable.app/dashboard
```

⚠️ **Substitua `[seu-projeto]`** pelo nome real do seu projeto Lovable!

---

## 3️⃣ Configurar Email Templates (Opcional mas Recomendado)

**Acesse:** Cloud → Authentication → Email Templates

### Template: Confirm Signup

**Subject:** Confirme seu cadastro no CRM Imobiliário

**Body (HTML):**
```html
<h2>Bem-vindo ao CRM Imobiliário!</h2>
<p>Olá,</p>
<p>Clique no link abaixo para confirmar seu email e ativar sua conta:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
<p>Se você não solicitou este cadastro, ignore este email.</p>
<br>
<p>Equipe CRM Imobiliário</p>
```

---

## 4️⃣ Desabilitar Confirmação de Email (APENAS PARA TESTES)

Se quiser testar sem precisar confirmar email:

**Acesse:** Cloud → Authentication → Providers → Email

**Desmarque:** "Confirm email"

⚠️ **ATENÇÃO:** Reative isso em produção para segurança!

---

## 5️⃣ Configurar Políticas RLS (Row Level Security)

**Acesse:** Cloud → Database → Tables → usuarios

Verifique se estas políticas existem:

### Política 1: Usuários podem ler seu próprio perfil
```sql
CREATE POLICY "Users can read own profile"
ON usuarios FOR SELECT
USING (auth.uid() = auth_id);
```

### Política 2: Usuários podem atualizar seu próprio perfil
```sql
CREATE POLICY "Users can update own profile"
ON usuarios FOR UPDATE
USING (auth.uid() = auth_id);
```

### Política 3: Permitir insert via trigger
```sql
CREATE POLICY "Enable insert for service role"
ON usuarios FOR INSERT
WITH CHECK (true);
```

---

## 6️⃣ Testar o Cadastro

1. Acesse `/login`
2. Clique na aba "Cadastrar"
3. Preencha os dados:
   - Nome completo
   - Email válido
   - Senha (mínimo 6 caracteres)
   - Confirmar senha
4. Clique em "Cadastrar"

### Fluxo Esperado:

**Com confirmação de email ativada:**
1. Mensagem: "Cadastro realizado! Verifique seu email para confirmar."
2. Verifique sua caixa de entrada (e spam)
3. Clique no link de confirmação
4. Será redirecionado para o dashboard
5. Perfil criado automaticamente na tabela `usuarios`

**Com confirmação desativada (testes):**
1. Mensagem: "Cadastro realizado! Verifique seu email para confirmar."
2. Pode fazer login imediatamente
3. Perfil criado automaticamente na tabela `usuarios`

---

## 🐛 Problemas Comuns

### "Erro ao cadastrar"
- Verifique se as Redirect URLs estão configuradas
- Confirme que a migration do trigger foi executada
- Veja os logs no Console do navegador (F12)

### Email não chega
- Verifique a pasta de spam
- Confirme a configuração de SMTP no Supabase
- Por padrão, Supabase usa email de teste (limite de 3 emails/hora em desenvolvimento)

### "Este email já está cadastrado"
- O email já foi usado anteriormente
- Para remover: Cloud → Authentication → Users → Delete

### Perfil não é criado na tabela usuarios
- Verifique se a migration foi executada corretamente
- Verifique os logs: Cloud → Database → Logs
- Confirme que o email foi confirmado (obrigatório para o trigger funcionar)

---

## ✅ Checklist Final

- [ ] Migration do trigger executada
- [ ] Site URL configurada
- [ ] Redirect URLs adicionadas
- [ ] Políticas RLS verificadas
- [ ] Email templates configurados (opcional)
- [ ] Teste de cadastro realizado
- [ ] Perfil criado automaticamente na tabela usuarios

---

## 📞 Suporte

Se os problemas persistirem:
1. Verifique o Console do navegador (F12 → Console)
2. Verifique os logs do Supabase (Cloud → Database → Logs)
3. Confirme que a tabela `usuarios` tem a coluna `nome_completo`
