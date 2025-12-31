-- Criar extensão para UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de contas UK
CREATE TABLE IF NOT EXISTS accounts_uk (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  account_id VARCHAR(10) UNIQUE NOT NULL, -- UK-001, UK-002, etc
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de registros de faturamento UK
CREATE TABLE IF NOT EXISTS revenue_records_uk (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  account_id VARCHAR(10) NOT NULL REFERENCES accounts_uk(account_id) ON DELETE CASCADE,
  gmv DECIMAL(12,2) NOT NULL DEFAULT 0, -- Em GBP (libras)
  sales INTEGER NOT NULL DEFAULT 0,
  commission_29 DECIMAL(12,2) NOT NULL DEFAULT 0, -- Em GBP
  commission_30 DECIMAL(12,2) NOT NULL DEFAULT 0, -- Em GBP
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, account_id) -- Evita registros duplicados para mesma data/conta
);

-- Função para atualizar updated_at automaticamente (reutilizar a existente)
-- CREATE OR REPLACE FUNCTION update_updated_at_column() já existe

-- Triggers para atualizar updated_at nas tabelas UK
CREATE TRIGGER update_accounts_uk_updated_at 
    BEFORE UPDATE ON accounts_uk 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_records_uk_updated_at 
    BEFORE UPDATE ON revenue_records_uk 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_revenue_records_uk_date ON revenue_records_uk(date);
CREATE INDEX IF NOT EXISTS idx_revenue_records_uk_account ON revenue_records_uk(account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_uk_account_id ON accounts_uk(account_id);

-- Comentários nas tabelas
COMMENT ON TABLE accounts_uk IS 'Tabela de contas do TikTok Shop UK';
COMMENT ON TABLE revenue_records_uk IS 'Registros diários de faturamento por conta UK (em GBP)';

-- Inserir conta de bônus UK
INSERT INTO accounts_uk (account_id, name) 
VALUES ('UK-BONUSES', 'Bônus UK')
ON CONFLICT (account_id) DO NOTHING;

-- Inserir algumas contas de exemplo para testar
INSERT INTO accounts_uk (account_id, name) VALUES 
('UK-001', 'Conta Principal UK'),
('UK-002', 'Conta Secundária UK'),
('UK-003', 'Conta de Teste UK')
ON CONFLICT (account_id) DO NOTHING;

-- Verificar se as tabelas foram criadas
SELECT 'accounts_uk' as table_name, COUNT(*) as total_records FROM accounts_uk
UNION ALL
SELECT 'revenue_records_uk' as table_name, COUNT(*) as total_records FROM revenue_records_uk;
