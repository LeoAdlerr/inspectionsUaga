import { IsString, IsNotEmpty, IsInt, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInspectionDto {

  @ApiProperty({
    description: 'Nome do motorista do veículo.',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty()
  driverName: string;

  // --- CORREÇÃO 1: Tornado Obrigatório (nullable: false na Entity) ---
  @ApiProperty({
    description: 'Número do registro de entrada (Obrigatório).',
    example: 'RE2025/123456',
  })
  @IsString()
  @IsNotEmpty() 
  entryRegistration: string;

  // --- CORREÇÃO 2: Tornado Obrigatório (nullable: false na Entity) ---
  @ApiProperty({
    description: 'Placas do veículo (Obrigatório).',
    example: 'BRA2E19',
  })
  @IsString()
  @IsNotEmpty()
  vehiclePlates: string;

  @ApiPropertyOptional({
    description: 'Número do documento de transporte (ex: CTe, AWB) (opcional).',
    example: '987654321',
  })
  @IsString()
  @IsOptional()
  transportDocument?: string;

  @ApiProperty({
    description: 'ID da modalidade da inspeção. (1: RODOVIARIO, 2: MARITIMO, 3: AEREO)',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  modalityId: number;

  // --- CORREÇÃO 3: Adicionado IsString e mudado para Opcional ---
  // (Pois se for um Baú/Sider, pode não ter container number)
  @ApiPropertyOptional({
    description: 'Número do container (obrigatório apenas for Container)',
    example: "ABCD1234567",
  })
  @IsString()
  @IsOptional() 
  containerNumber: string;

  @ApiProperty({
    description: 'ID do tipo de operação. (1: VERDE, 2: LARANJA, 3: VERMELHA)',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  operationTypeId: number;

  @ApiProperty({
    description: 'ID do tipo de unidade. (1: CONTAINER, 2: BAU)',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  unitTypeId: number;

  @ApiPropertyOptional({
    description: 'ID do tipo de contêiner. (1: DRY_20, 2: DRY_40, etc.)',
    example: 2,
  })
  @IsInt()
  @IsOptional()
  containerTypeId?: number;

  @ApiPropertyOptional({
    description: 'Comprimento verificado na inspeção, em metros (opcional).',
    example: 12.02,
  })
  @IsNumber()
  @IsOptional()
  verifiedLength?: number;

  @ApiPropertyOptional({
    description: 'Largura verificada na inspeção, em metros (opcional).',
    example: 2.35,
  })
  @IsNumber()
  @IsOptional()
  verifiedWidth?: number;

  @ApiPropertyOptional({
    description: 'Altura verificada na inspeção, em metros (opcional).',
    example: 2.69,
  })
  @IsNumber()
  @IsOptional()
  verifiedHeight?: number;
}