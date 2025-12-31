-- Remover contas fictícias do UK, mantendo apenas a conta de bônus
DELETE FROM accounts_uk WHERE account_id IN ('UK-001', 'UK-002', 'UK-003');

-- Verificar se restou apenas a conta de bônus
SELECT * FROM accounts_uk;

-- Verificar se não há registros de faturamento (deve estar vazio mesmo)
SELECT COUNT(*) as total_records FROM revenue_records_uk;
