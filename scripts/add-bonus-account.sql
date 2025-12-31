-- Adicionar a conta especial C-BONUSES
INSERT INTO accounts (account_id, name) 
VALUES ('C-BONUSES', 'Conta de Bônus')
ON CONFLICT (account_id) DO NOTHING;

-- Verificar se foi inserida corretamente
SELECT * FROM accounts WHERE account_id = 'C-BONUSES';
