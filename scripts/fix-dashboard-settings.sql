-- Limpar tabela de configurações para evitar duplicatas
DELETE FROM dashboard_settings;

-- Inserir apenas uma configuração padrão
INSERT INTO dashboard_settings (exchange_rate, updated_by) 
VALUES (5.20, 'System');

-- Verificar se foi inserido corretamente
SELECT * FROM dashboard_settings;
