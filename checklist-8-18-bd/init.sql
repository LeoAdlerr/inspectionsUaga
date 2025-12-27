-- =============================================================================
-- DATABASE SETUP
-- =============================================================================
CREATE DATABASE IF NOT EXISTS `uagabd`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'uaga_user'@'%' IDENTIFIED BY 'uaga_password';
GRANT ALL PRIVILEGES ON `uagabd`.* TO 'uaga_user'@'%';
FLUSH PRIVILEGES;

ALTER DATABASE `uagabd` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `uagabd`;

-- =============================================================================
-- DDL - TABELAS DE LOOKUP (MESTRAS)
-- =============================================================================
CREATE TABLE `lookup_statuses` (`id` INT PRIMARY KEY, `name` VARCHAR(50) NOT NULL UNIQUE) ENGINE=InnoDB;
CREATE TABLE `lookup_modalities` (`id` INT PRIMARY KEY, `name` VARCHAR(50) NOT NULL UNIQUE) ENGINE=InnoDB;
CREATE TABLE `lookup_operation_types` (`id` INT PRIMARY KEY, `name` VARCHAR(50) NOT NULL UNIQUE) ENGINE=InnoDB;
CREATE TABLE `lookup_unit_types` (`id` INT PRIMARY KEY, `name` VARCHAR(50) NOT NULL UNIQUE) ENGINE=InnoDB;
CREATE TABLE `lookup_container_types` (`id` INT PRIMARY KEY, `name` VARCHAR(50) NOT NULL UNIQUE) ENGINE=InnoDB;
CREATE TABLE `lookup_checklist_item_statuses` (`id` INT PRIMARY KEY, `name` VARCHAR(50) NOT NULL UNIQUE) ENGINE=InnoDB;
CREATE TABLE `lookup_seal_verification_statuses` (`id` INT PRIMARY KEY, `name` VARCHAR(50) NOT NULL UNIQUE) ENGINE=InnoDB;

-- NOVAS LOOKUPS PARA SUBSTITUIR ENUMS
CREATE TABLE `lookup_seal_stages` (`id` INT PRIMARY KEY, `name` VARCHAR(50) NOT NULL UNIQUE) ENGINE=InnoDB;
CREATE TABLE `lookup_image_categories` (`id` INT PRIMARY KEY, `name` VARCHAR(50) NOT NULL UNIQUE) ENGINE=InnoDB;

CREATE TABLE `master_inspection_points` (
  `id` INT PRIMARY KEY,
  `point_number` INT NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- =============================================================================
-- DDL - AUTENTICACAO E AUTORIZACAO
-- =============================================================================
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(255) NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `signature_path` VARCHAR(512) NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_username` (`username`)
) ENGINE=InnoDB;

CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE `user_roles` (
  `user_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- DDL - TABELAS PRINCIPAIS DO NEGOCIO
-- =============================================================================
CREATE TABLE `inspections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `inspector_id` INT NULL COMMENT 'Nulo ate que um inspetor assuma.',
  `conferente_id` INT NULL COMMENT 'Nulo ate que um conferente assuma.',
  `gate_operator_id` INT NULL COMMENT 'Usuario da Portaria que liberou a saida.',
  
  `status_id` INT NOT NULL,
  
  `entry_registration` VARCHAR(100) NOT NULL,
  `vehicle_plates` VARCHAR(20) NOT NULL,
  `transport_document` VARCHAR(100) NULL,
  `modality_id` INT NOT NULL,
  `operation_type_id` INT NOT NULL,
  `unit_type_id` INT NOT NULL,
  `container_type_id` INT NULL,
  `container_number` VARCHAR(20) NOT NULL,
  
  `has_precinto` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=Com Precinto, 0=Sem Precinto',
  
  `verified_length` DECIMAL(10, 2) NULL,
  `verified_width` DECIMAL(10, 2) NULL,
  `verified_height` DECIMAL(10, 2) NULL,
  
  -- TIMESTAMPS DO PROCESSO
  `start_datetime` DATETIME NOT NULL,
  `inspection_started_at` DATETIME NULL,
  `end_datetime` DATETIME NULL,
  `conference_started_at` DATETIME NULL,
  `conference_ended_at` DATETIME NULL,
  `gate_out_at` DATETIME NULL COMMENT 'Data/Hora da saida fisica do veiculo (Portaria)',
  
  `driver_name` VARCHAR(255) NOT NULL,
  `driver_signature_path` VARCHAR(512) NULL,
  `inspector_signature_path` VARCHAR(512) NULL,
  
  -- Lacres Externos (Lidos na entrada)
  `seal_shipper` VARCHAR(100) NULL,
  `seal_rfb` VARCHAR(100) NULL,
  
  -- Validacao de Grade na Portaria
  `seal_verification_rfb_status_id` INT NULL,
  `seal_verification_shipper_status_id` INT NULL,
  `seal_verification_tape_status_id` INT NULL,
  `seal_verification_responsible_name` VARCHAR(255) NULL,
  `seal_verification_signature_path` VARCHAR(512) NULL,
  `seal_verification_date` DATE NULL,
  
  `observations` TEXT NULL,
  `action_taken` TEXT NULL,
  `generated_pdf_path` VARCHAR(512) NULL,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- CONSTRAINTS
  FOREIGN KEY (`inspector_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`conferente_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`gate_operator_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`status_id`) REFERENCES `lookup_statuses`(`id`),
  FOREIGN KEY (`modality_id`) REFERENCES `lookup_modalities`(`id`),
  FOREIGN KEY (`operation_type_id`) REFERENCES `lookup_operation_types`(`id`),
  FOREIGN KEY (`unit_type_id`) REFERENCES `lookup_unit_types`(`id`),
  FOREIGN KEY (`container_type_id`) REFERENCES `lookup_container_types`(`id`),
  FOREIGN KEY (`seal_verification_rfb_status_id`) REFERENCES `lookup_seal_verification_statuses`(`id`),
  FOREIGN KEY (`seal_verification_shipper_status_id`) REFERENCES `lookup_seal_verification_statuses`(`id`),
  FOREIGN KEY (`seal_verification_tape_status_id`) REFERENCES `lookup_seal_verification_statuses`(`id`),
  
  -- INDICES
  INDEX `idx_inspections_driver_name` (`driver_name`),
  INDEX `idx_inspections_vehicle_plates` (`vehicle_plates`),
  
  -- [OTIMIZACAO] Indice composto para filas de trabalho (Polling)
  INDEX `idx_status_updated` (`status_id`, `updated_at`)
) ENGINE=InnoDB;

CREATE TABLE `inspection_checklist_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `inspection_id` INT NOT NULL,
  `master_point_id` INT NOT NULL,
  `status_id` INT NOT NULL,
  `observations` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE `unique_inspection_point` (`inspection_id`, `master_point_id`),
  FOREIGN KEY (`inspection_id`) REFERENCES `inspections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`master_point_id`) REFERENCES `master_inspection_points`(`id`),
  FOREIGN KEY (`status_id`) REFERENCES `lookup_checklist_item_statuses`(`id`),
  INDEX `idx_inspection_id` (`inspection_id`)
) ENGINE=InnoDB;

CREATE TABLE `item_evidences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_id` INT NOT NULL,
  `file_path` VARCHAR(512) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` INT NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`item_id`) REFERENCES `inspection_checklist_items`(`id`) ON DELETE CASCADE,
  INDEX `idx_item_id` (`item_id`)
) ENGINE=InnoDB;


CREATE TABLE `inspection_seals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `inspection_id` INT NOT NULL,
  `seal_number` VARCHAR(100) NOT NULL,
  `stage_id` INT NOT NULL COMMENT 'FK para lookup_seal_stages',
  `photo_path` VARCHAR(512) NULL,
  
  -- [Portaria] Validacao individual do lacre
  `verification_status_id` INT NULL COMMENT 'Status da verificacao na portaria (OK/NOK)',
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`inspection_id`) REFERENCES `inspections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`stage_id`) REFERENCES `lookup_seal_stages`(`id`),
  FOREIGN KEY (`verification_status_id`) REFERENCES `lookup_seal_verification_statuses`(`id`),
  INDEX `idx_seals_inspection` (`inspection_id`)
) ENGINE=InnoDB;

CREATE TABLE `inspection_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `inspection_id` INT NOT NULL,
  `category_id` INT NOT NULL COMMENT 'FK para lookup_image_categories',
  `photo_path` VARCHAR(512) NOT NULL,
  `description` TEXT NULL, 
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`inspection_id`) REFERENCES `inspections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `lookup_image_categories`(`id`),
  INDEX `idx_images_inspection` (`inspection_id`)
) ENGINE=InnoDB;

-- =============================================================================
-- DML - DADOS INICIAIS
-- =============================================================================

INSERT INTO `lookup_statuses` (`id`, `name`) VALUES 
(1, 'EM_INSPECAO'), 
(2, 'APROVADO'),                
(3, 'REPROVADO'),               
(4, 'AGUARDANDO_INSPECAO'),
(5, 'EM_CONFERENCIA'), 
(6, 'CONFERENCIA_FINALIZADA'),
(7, 'AGUARDANDO_CONFERENCIA'),
(8, 'APROVADO_COM_RESSALVAS'), 
(9, 'AGUARDANDO_LACRACAO'),
(10, 'LIBERADO_SAIDA'),
(11, 'FINALIZADO'),
(12, 'REPROVADO_POS_AVALIACAO'),
(13, 'AGUARDANDO_SAIDA');

INSERT INTO `lookup_modalities` (`id`, `name`) VALUES (1, 'RODOVIARIO'), (2, 'MARITIMO'), (3, 'AEREO');
INSERT INTO `lookup_operation_types` (`id`, `name`) VALUES (1, 'VERDE'), (2, 'LARANJA'), (3, 'VERMELHA');
INSERT INTO `lookup_unit_types` (`id`, `name`) VALUES (1, 'CONTAINER'), (2, 'BAU');
INSERT INTO `lookup_container_types` (`id`, `name`) VALUES (1, 'DRY_20'), (2, 'DRY_40'), (3, 'DRY_HC_40'), (4, 'REEFER_40');
INSERT INTO `lookup_checklist_item_statuses` (`id`, `name`) VALUES (1, 'EM_INSPECAO'), (2, 'CONFORME'), (3, 'NAO_CONFORME'), (4, 'N_A');
INSERT INTO `lookup_seal_verification_statuses` (`id`, `name`) VALUES (1, 'OK'), (2, 'NAO_OK'), (3, 'N_A');

-- LOOKUPS DE LACRE E IMAGENS
INSERT INTO `lookup_seal_stages` (`id`, `name`) VALUES 
(1, 'INITIAL'), 
(2, 'FINAL'), 
(3, 'CONFERENCE'),
(4, 'RFB'),      
(5, 'ARMADOR');  

INSERT INTO `lookup_image_categories` (`id`, `name`) VALUES 
(1, 'PLATE'), 
(2, 'PANORAMIC'), 
(3, 'CONTAINER_DOORS'), 
(4, 'OTHER'),
(5, 'PRECINTO_FRONT'),
(6, 'PRECINTO_REAR'),
(7, 'PRECINTO_LEFT'),
(8, 'PRECINTO_RIGHT');

INSERT INTO `master_inspection_points` (`id`, `point_number`, `name`, `description`, `category`) VALUES
(1, 1, 'SECAO INFERIOR', 'Verificar com auxilio de espelho e lanterna os espacos entre as vigas estruturais.', 'CONTEINER'),
(2, 2, 'PORTA (Interior e Exterior)', 'Verificar mecanismos de travamento e parafusos. Martelar levemente buscando som oco.', 'CONTEINER'),
(3, 3, 'LATERAL DIREITA', 'Verificar reparos incomuns nas vigas estruturais. Martelar levemente buscando som oco.', 'CONTEINER'),
(4, 4, 'LATERAL ESQUERDA', 'Verificar reparos incomuns nas vigas estruturais. Martelar levemente buscando som oco.', 'CONTEINER'),
(5, 5, 'PAREDE FRONTAL', 'Verificar se possui sistema de refrigeracao. Martelar levemente buscando som oco.', 'CONTEINER'),
(6, 6, 'TETO', 'Verificar se a altura e uniforme em todo conteiner. Martelar levemente buscando som oco.', 'CONTEINER'),
(7, 7, 'PISO/ASSOALHO (Interior)', 'Verificar se o piso esta nivelado e se ha reparos ou paineis novos.', 'CONTEINER'),
(8, 8, 'IDENTIFICACAO DE PRAGAS VISIVEIS', 'Verificar a unidade de carga em busca de pragas visiveis.', 'CONTEINER'),
(9, 9, 'PARA-CHOQUES', 'Verificar com espelho e lanterna materiais ou compartimentos escondidos.', 'VEICULO'),
(10, 10, 'MOTOR', 'Verificar com espelhos e lanternas a area do motor, tampas e filtros.', 'VEICULO'),
(11, 11, 'PNEUS', 'Martelar levemente em todo pneu, incluindo steps, buscando som oco.', 'VEICULO'),
(12, 12, 'PISO DO CAMINHAO', 'Levantar o carpete para confirmar se existem novos reparos ou compartimentos.', 'VEICULO'),
(13, 13, 'TANQUE DE COMBUSTIVEL', 'Martelar levemente para verificar se nao ha solidos dentro do tanque.', 'VEICULO'),
(14, 14, 'CABINE', 'Verificar dentro e fora de compartimentos por qualquer conteudo ilegal.', 'VEICULO'),
(15, 15, 'TANQUE DE AR', 'Martelar levemente em todo tanque de ar e verificar sinais de adulteracao.', 'VEICULO'),
(16, 16, 'EIXO DE TRANSMISSAO', 'Verificar sinais de reparos ou pinturas novas e martelar levemente.', 'VEICULO'),
(17, 17, 'AREA DA 5 RODA', 'Verificar espacos livres e area da bateria por conteudo ilegal.', 'VEICULO'),
(18, 18, 'SISTEMA DE EXAUSTAO', 'Verificar se nao existem cordas ou itens amarrados e se o escapamento nao esta solto.', 'VEICULO');

INSERT INTO `roles` (`id`, `name`, `description`) VALUES 
(1, 'ADMIN', 'Administrador do sistema com acesso total.'),
(2, 'DOCUMENTAL', 'Usuario que cria e valida as inspecoes.'),
(3, 'INSPECTOR', 'Usuario responsavel por realizar o checklist de inspecao.'),
(4, 'CONFERENTE', 'Usuario responsavel pelos processos de lacre e carregamento.'),
(5, 'PORTARIA', 'Usuario que realiza a verificacao final na saida do veiculo.');