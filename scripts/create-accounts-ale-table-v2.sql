-- Dropar a tabela anterior se existir para recriar corretamente
DROP TABLE IF EXISTS accounts_ale;

-- Criar tabela accounts_ale com id UUID gerado automaticamente
CREATE TABLE accounts_ale (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhorar performance
CREATE INDEX idx_accounts_ale_account_id ON accounts_ale(account_id);

-- Adicionar alguns dados de exemplo (opcional)
INSERT INTO accounts_ale (account_id, name) VALUES
  ('ALE-001', 'Conta Ale Principal'),
  ('ALE-002', 'Conta Ale Secundária')
ON CONFLICT (account_id) DO NOTHING;
