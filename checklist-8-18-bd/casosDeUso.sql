-- =============================================================================
-- Script de Validacao de Casos de Uso (Versao com Autenticacao)
-- Dialeto: MySQL
-- Objetivo: Simular os fluxos de usuario da aplicacao para validar se o
--           modelo de dados suporta todas as regras de negocio do MVP,
--           incluindo a integracao com a tabela de usuarios.
-- =============================================================================

-- Simulacao de Login: Define qual usuario esta realizando as operacoes.
-- O usuario com ID 2 e o 'Carlos Inspetor', conforme nosso script init.sql.
SET @inspector_id = 2;


-- =============================================================================
-- CENARIO 1: Inspecao que sera APROVADA
-- =============================================================================

-- Fluxo 2: Realizacao de uma Nova Inspecao
-- -----------------------------------------------------------------------------
-- Passo 1: O inspetor (ID: @inspector_id) inicia uma nova inspecao.
-- Acao: Um novo registro e criado na tabela `inspections` com status 'EM_INSPECAO'.
--       Automaticamente, os 18 itens de checklist sao criados para esta inspecao.
-- -----------------------------------------------------------------------------
START TRANSACTION;

-- Insere a inspecao principal, agora usando inspector_id
INSERT INTO `inspections` (
    `inspector_id`, `status_id`, `entry_registration`, `vehicle_plates`,
    `modality_id`, `operation_type_id`, `unit_type_id`, `container_type_id`,
    `start_datetime`, `driver_name`
) VALUES (
    @inspector_id, 1, 'REG-2025-ABC', 'XYZ-1234',
    1, 1, 1, 2,
    NOW(), 'Joao Motorista'
);

-- Pega o ID da inspecao recem-criada
SET @inspection_id_aprovada = LAST_INSERT_ID();

-- Insere os 18 itens de checklist vinculados a esta inspecao
INSERT INTO `inspection_checklist_items` (`inspection_id`, `master_point_id`, `status_id`)
SELECT @inspection_id_aprovada, `id`, 1 FROM `master_inspection_points`;

COMMIT;

-- Verificacao: Mostra a inspecao e seus itens recem-criados
SELECT id, inspector_id, status_id FROM `inspections` WHERE id = @inspection_id_aprovada;
SELECT master_point_id, status_id, observations FROM `inspection_checklist_items` WHERE inspection_id = @inspection_id_aprovada;


-- -----------------------------------------------------------------------------
-- Passo 2: O inspetor avalia alguns pontos do checklist.
-- Acao: Atualiza o status e as observacoes de itens especificos. Anexa evidencias.
-- -----------------------------------------------------------------------------
START TRANSACTION;

-- Atualiza o Ponto 11 (PNEUS) para 'CONFORME'
UPDATE `inspection_checklist_items`
SET `status_id` = 2, `observations` = 'Todos os pneus em bom estado.'
WHERE `inspection_id` = @inspection_id_aprovada AND `master_point_id` = 11;

-- Atualiza o Ponto 10 (MOTOR) para 'CONFORME' e anexa uma evidencia
UPDATE `inspection_checklist_items`
SET `status_id` = 2, `observations` = 'Motor limpo, sem vazamentos aparentes.'
WHERE `inspection_id` = @inspection_id_aprovada AND `master_point_id` = 10;

SET @item_motor_id = (SELECT id FROM `inspection_checklist_items` WHERE `inspection_id` = @inspection_id_aprovada AND `master_point_id` = 10);
INSERT INTO `item_evidences` (`item_id`, `file_path`, `file_name`, `file_size`, `mime_type`)
VALUES (@item_motor_id, '/uploads/insp_1/10_timestamp.jpg', 'motor_ok.jpg', 1024, 'image/jpeg');

COMMIT;

-- Verificacao: Mostra os itens atualizados e a nova evidencia
SELECT master_point_id, status_id, observations FROM `inspection_checklist_items` WHERE inspection_id = @inspection_id_aprovada AND master_point_id IN (10, 11);
SELECT * FROM `item_evidences` WHERE item_id = @item_motor_id;


-- Fluxo 3: Finalizacao da Inspecao
-- -----------------------------------------------------------------------------
-- Passo 3: O inspetor avalia os 16 pontos restantes como 'CONFORME' ou 'N/A'.
-- -----------------------------------------------------------------------------
UPDATE `inspection_checklist_items`
SET `status_id` = 2 -- CONFORME
WHERE `inspection_id` = @inspection_id_aprovada AND `status_id` = 1; -- Atualiza todos que ainda estao 'EM_INSPECAO'


-- -----------------------------------------------------------------------------
-- Passo 4: O sistema aplica a regra de avaliacao e finaliza a inspecao.
-- Acao: Como todos os itens estao 'CONFORME', o status da inspecao e atualizado para 'APROVADO'.
--       O caminho do PDF gerado e salvo.
-- -----------------------------------------------------------------------------
UPDATE `inspections`
SET
    `status_id` = 2, -- APROVADO
    `end_datetime` = NOW(),
    `generated_pdf_path` = CONCAT('/reports/inspection_', @inspection_id_aprovada, '.pdf')
WHERE id = @inspection_id_aprovada;

-- Verificacao: Mostra o status final da inspecao
SELECT i.id, u.full_name as inspector_name, i.status_id, i.generated_pdf_path
FROM `inspections` i
JOIN `users` u ON i.inspector_id = u.id
WHERE i.id = @inspection_id_aprovada;


-- =============================================================================
-- CENARIO 2: Inspecao que sera REPROVADA
-- =============================================================================

-- Fluxo 2: Realizacao de uma Nova Inspecao
-- -----------------------------------------------------------------------------
-- Passo 1: O inspetor (ID: @inspector_id) inicia uma segunda inspecao.
-- -----------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `inspections` (
    `inspector_id`, `status_id`, `entry_registration`, `vehicle_plates`,
    `modality_id`, `operation_type_id`, `unit_type_id`, `container_type_id`,
    `start_datetime`, `driver_name`
) VALUES (
    @inspector_id, 1, 'REG-2025-DEF', 'ABC-5678',
    1, 2, 1, 3,
    NOW(), 'Maria Condutora'
);
SET @inspection_id_reprovada = LAST_INSERT_ID();
INSERT INTO `inspection_checklist_items` (`inspection_id`, `master_point_id`, `status_id`)
SELECT @inspection_id_reprovada, `id`, 1 FROM `master_inspection_points`;

COMMIT;


-- -----------------------------------------------------------------------------
-- Passo 2: O inspetor avalia a maioria dos pontos como 'CONFORME', mas um como 'NAO_CONFORME'.
-- -----------------------------------------------------------------------------
START TRANSACTION;

-- Avalia 17 pontos como 'CONFORME'
UPDATE `inspection_checklist_items`
SET `status_id` = 2
WHERE `inspection_id` = @inspection_id_reprovada AND `master_point_id` != 16;

-- Avalia o Ponto 16 (EIXO DE TRANSMISSAO) como 'NAO_CONFORME'
UPDATE `inspection_checklist_items`
SET `status_id` = 3, `observations` = 'Ponto de ferrugem avancada detectado no eixo. Requer manutencao imediata.'
WHERE `inspection_id` = @inspection_id_reprovada AND `master_point_id` = 16;

SET @item_eixo_id = (SELECT id FROM `inspection_checklist_items` WHERE `inspection_id` = @inspection_id_reprovada AND `master_point_id` = 16);
INSERT INTO `item_evidences` (`item_id`, `file_path`, `file_name`, `file_size`, `mime_type`)
VALUES (@item_eixo_id, '/uploads/insp_2/16_timestamp.jpg', 'eixo_danificado.jpg', 2048, 'image/jpeg');

COMMIT;


-- Fluxo 3: Finalizacao da Inspecao
-- -----------------------------------------------------------------------------
-- Passo 3: O sistema aplica a regra de avaliacao.
-- Acao: Como ha um item 'NAO_CONFORME', o status da inspecao e atualizado para 'REPROVADO'.
-- -----------------------------------------------------------------------------
UPDATE `inspections`
SET
    `status_id` = 3, -- REPROVADO
    `end_datetime` = NOW(),
    `generated_pdf_path` = CONCAT('/reports/inspection_', @inspection_id_reprovada, '.pdf')
WHERE id = @inspection_id_reprovada;

-- Verificacao: Mostra o status final da inspecao reprovada
SELECT i.id, u.full_name as inspector_name, i.status_id, i.generated_pdf_path
FROM `inspections` i
JOIN `users` u ON i.inspector_id = u.id
WHERE i.id = @inspection_id_reprovada;


-- =============================================================================
-- Fluxo 4: Consulta e Analise no Dashboard
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Acao: O usuario visualiza todas as inspecoes no dashboard.
-- -----------------------------------------------------------------------------
SELECT
    i.id AS 'ID da Inspecao',
    u.full_name AS 'Inspetor',
    ls.name AS 'Status',
    i.start_datetime AS 'Data de Inicio'
FROM
    `inspections` i
JOIN
    `lookup_statuses` ls ON i.status_id = ls.id
JOIN
    `users` u ON i.inspector_id = u.id
ORDER BY
    i.start_datetime DESC;


-- -----------------------------------------------------------------------------
-- Acao: O usuario clica para ver os detalhes de uma inspecao especifica (a reprovada).
-- -----------------------------------------------------------------------------
SELECT
    i.id AS 'ID da Inspecao',
    u.full_name AS 'Inspetor',
    ls.name AS 'Status Geral',
    mip.point_number AS 'Ponto',
    mip.name AS 'Item Verificado',
    lci.name AS 'Status do Item',
    ici.observations AS 'Observacoes',
    ie.file_name AS 'Evidencia'
FROM
    `inspections` i
JOIN
    `inspection_checklist_items` ici ON i.id = ici.inspection_id
JOIN
    `master_inspection_points` mip ON ici.master_point_id = mip.id
JOIN
    `lookup_statuses` ls ON i.status_id = ls.id
JOIN
    `lookup_checklist_item_statuses` lci ON ici.status_id = lci.id
JOIN
    `users` u ON i.inspector_id = u.id
LEFT JOIN
    `item_evidences` ie ON ici.id = ie.item_id
WHERE
    i.id = @inspection_id_reprovada
ORDER BY
    mip.point_number;