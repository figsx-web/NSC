-- Atualizar o nome da conta de bônus para apenas "Bônus"
UPDATE accounts 
SET name = 'Bônus' 
WHERE account_id = 'C-BONUSES';

-- Verificar se foi atualizada corretamente
SELECT * FROM accounts WHERE account_id = 'C-BONUSES';
