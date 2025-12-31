-- Criar extensão para UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de contas
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  account_id VARCHAR(10) UNIQUE NOT NULL, -- C-001, C-002, etc
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de registros de faturamento
CREATE TABLE IF NOT EXISTS revenue_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  account_id VARCHAR(10) NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  gmv DECIMAL(12,2) NOT NULL DEFAULT 0,
  sales INTEGER NOT NULL DEFAULT 0,
  commission_29 DECIMAL(12,2) NOT NULL DEFAULT 0,
  commission_30 DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, account_id) -- Evita registros duplicados para mesma data/conta
);

-- Tabela para configurações do dashboard
CREATE TABLE IF NOT EXISTS dashboard_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exchange_rate DECIMAL(8,4) DEFAULT 5.20,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by VARCHAR(100) DEFAULT 'Admin'
);

-- Inserir configuração inicial
INSERT INTO dashboard_settings (exchange_rate) 
VALUES (5.20) 
ON CONFLICT DO NOTHING;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_accounts_updated_at 
    BEFORE UPDATE ON accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_records_updated_at 
    BEFORE UPDATE ON revenue_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_settings_updated_at 
    BEFORE UPDATE ON dashboard_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_revenue_records_date ON revenue_records(date);
CREATE INDEX IF NOT EXISTS idx_revenue_records_account ON revenue_records(account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_account_id ON accounts(account_id);

-- Comentários nas tabelas
COMMENT ON TABLE accounts IS 'Tabela de contas do TikTok Shop';
COMMENT ON TABLE revenue_records IS 'Registros diários de faturamento por conta';
COMMENT ON TABLE dashboard_settings IS 'Configurações globais do dashboard';
