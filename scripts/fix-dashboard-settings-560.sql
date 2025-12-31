-- Limpar tabela de configurações para evitar duplicatas
DELETE FROM dashboard_settings;

-- Inserir apenas uma configuração padrão com 5.60
INSERT INTO dashboard_settings (exchange_rate, updated_by) 
VALUES (5.60, 'System');

-- Verificar se foi inserido corretamente
SELECT * FROM dashboard_settings;
