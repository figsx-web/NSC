-- Criar tabela accounts_ale para as contas ALE
CREATE TABLE IF NOT EXISTS accounts_ale (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_accounts_ale_account_id ON accounts_ale(account_id);

-- Adicionar alguns dados de exemplo (opcional)
INSERT INTO accounts_ale (id, account_id, name) VALUES
  (gen_random_uuid()::text, 'ALE-001', 'Conta Ale Principal'),
  (gen_random_uuid()::text, 'ALE-002', 'Conta Ale Secundária')
ON CONFLICT (account_id) DO NOTHING;
