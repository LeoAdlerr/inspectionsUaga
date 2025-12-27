import { IsString, IsInt, IsOptional, IsNumber, IsDateString, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInspectionDto {
  @ApiPropertyOptional({ description: 'ID do novo inspetor responsável pela vistoria.' })
  @IsInt()
  @IsOptional()
  inspectorId?: number;

  @ApiPropertyOptional({ description: 'Nome do motorista do veículo.' })
  @IsString()
  @IsOptional()
  driverName?: string;
  
  @ApiPropertyOptional({ description: 'Número do registro de entrada.' })
  @IsString()
  @IsOptional()
  entryRegistration?: string;

  // Opcional na atualização ---
  @ApiPropertyOptional({ description: 'Número do container.' })
  @IsString()
  @IsOptional()
  containerNumber?: string;

  @ApiPropertyOptional({ description: 'Placas do veículo.' })
  @IsString()
  @IsOptional()
  vehiclePlates?: string;

  @ApiPropertyOptional({ description: 'Número do documento de transporte (ex: CTe, AWB).' })
  @IsString()
  @IsOptional()
  transportDocument?: string;

  @ApiPropertyOptional({ description: 'Comprimento verificado em metros (ex: 12.02).' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'O comprimento deve ser um número com no máximo 2 casas decimais.' }
  )
  @Max(99999999.99, { message: 'O valor do comprimento é muito alto.' })
  @IsOptional()
  verifiedLength?: number;

  @ApiPropertyOptional({ description: 'Largura verificada na inspeção, em metros.' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'A largura deve ser um número com no máximo 2 casas decimais.' }
  )
  @Max(99999999.99, { message: 'O valor da largura é muito alto.' })
  @IsOptional()
  verifiedWidth?: number;

  @ApiPropertyOptional({ description: 'Altura verificada na inspeção, em metros.' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'A altura deve ser um número com no máximo 2 casas decimais.' }
  )
  @Max(99999999.99, { message: 'O valor da altura é muito alto.' })
  @IsOptional()
  verifiedHeight?: number;

  // --- OBSERVAÇÃO: Campos de Lacre UAGA removidos daqui ---
  // Eles devem ser atualizados APENAS pelos endpoints de fluxo (seal-initial, finalize-conference)

  @ApiPropertyOptional({ description: 'Lacre do armador (shipper) - Dado documental.' })
  @IsString()
  @IsOptional()
  sealShipper?: string;

  @ApiPropertyOptional({ description: 'Lacre Receita Federal (RFB) - Dado documental.' })
  @IsString()
  @IsOptional()
  sealRfb?: string;

  // --- Campos de Verificação de Saída (Portaria) ---

  @ApiPropertyOptional({ description: 'Nome do responsável pela verificação de lacres.' })
  @IsString()
  @IsOptional()
  sealVerificationResponsibleName?: string;

  @ApiPropertyOptional({ description: 'Data da verificação de lacres (formato AAAA-MM-DD).', example: '2025-07-15' })
  @IsDateString()
  @IsOptional()
  sealVerificationDate?: string;

  @ApiPropertyOptional({ description: 'Status do lacre RFB (ID de lookup_seal_verification_statuses).' })
  @IsInt()
  @IsOptional()
  sealVerificationRfbStatusId?: number;

  @ApiPropertyOptional({ description: 'Status do lacre Shipper (ID de lookup_seal_verification_statuses).' })
  @IsInt()
  @IsOptional()
  sealVerificationShipperStatusId?: number;

  @ApiPropertyOptional({ description: 'Status da fita lacre UAGA (ID de lookup_seal_verification_statuses).' })
  @IsInt()
  @IsOptional()
  sealVerificationTapeStatusId?: number;

  // --- Campos Gerais ---

  @ApiPropertyOptional({ description: 'Observações gerais sobre a inspeção.' })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiPropertyOptional({ description: 'Providências tomadas durante a inspeção.' })
  @IsString()
  @IsOptional()
  actionTaken?: string;

  // --- IDs de Relacionamento (Correção de cadastro) ---

  @ApiPropertyOptional({ description: 'ID da modalidade da inspeção.' })
  @IsInt()
  @IsOptional()
  modalityId?: number;

  @ApiPropertyOptional({ description: 'ID do tipo de operação.' })
  @IsInt()
  @IsOptional()
  operationTypeId?: number;

  @ApiPropertyOptional({ description: 'ID do tipo de unidade.' })
  @IsInt()
  @IsOptional()
  unitTypeId?: number;

  @ApiPropertyOptional({ description: 'ID do tipo de contêiner.' })
  @IsInt()
  @IsOptional()
  containerTypeId?: number;
}