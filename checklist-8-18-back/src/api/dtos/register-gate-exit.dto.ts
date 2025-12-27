import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para validação individual de um lacre específico
 * Ex: Lacre "12345" está OK.
 */
export class SealVerificationDto {
  @ApiProperty({ description: 'ID do Lacre (tabela inspection_seals)' })
  @IsInt()
  sealId: number;

  @ApiProperty({ description: 'ID do Status de Verificação (1=OK, 2=NOK, 3=NA)' })
  @IsInt()
  statusId: number;
}

/**
 * DTO Principal para o Registro de Saída
 */
export class RegisterGateExitDto {
  // --- Status Gerais (Grade do PDF) ---
  
  @ApiProperty({ description: 'Status Geral do Lacre RFB (1=OK, 2=NOK, 3=NA)', required: false })
  @IsInt()
  @IsOptional()
  sealVerificationRfbStatusId?: number;

  @ApiProperty({ description: 'Status Geral do Lacre Armador (1=OK, 2=NOK, 3=NA)', required: false })
  @IsInt()
  @IsOptional()
  sealVerificationShipperStatusId?: number;

  @ApiProperty({ description: 'Status da Fita (1=OK, 2=NOK, 3=NA)', required: false })
  @IsInt()
  @IsOptional()
  sealVerificationTapeStatusId?: number;

  // --- Validação Individual (Novidade do Banco) ---

  @ApiProperty({ description: 'Validação individual dos lacres', type: [SealVerificationDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SealVerificationDto) // Necessário para transformar o JSON em objeto SealVerificationDto
  @IsOptional()
  sealVerifications?: SealVerificationDto[];
}