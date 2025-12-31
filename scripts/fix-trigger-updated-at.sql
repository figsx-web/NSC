-- Verificar e corrigir o trigger para dashboard_settings
-- Primeiro, vamos ver a estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dashboard_settings';

-- Recriar o trigger corretamente
DROP TRIGGER IF EXISTS update_dashboard_settings_updated_at ON dashboard_settings;

-- Função atualizada para lidar com o campo correto
CREATE OR REPLACE FUNCTION update_dashboard_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recriar o trigger com o nome correto do campo
CREATE TRIGGER update_dashboard_settings_updated_at 
    BEFORE UPDATE ON dashboard_settings 
    FOR EACH ROW EXECUTE FUNCTION update_dashboard_settings_updated_at();

-- Limpar e inserir configuração padrão
DELETE FROM dashboard_settings;
INSERT INTO dashboard_settings (exchange_rate, updated_by) 
VALUES (5.60, 'System');
