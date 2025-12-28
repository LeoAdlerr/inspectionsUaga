import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum GateRejectionReason {
  WRONG_DATA = 'WRONG_DATA',           
  SEAL_DIVERGENCE = 'SEAL_DIVERGENCE', 
}

export class RejectGateDto {
  @ApiProperty({
    description: 'Motivo da rejeição',
    enum: GateRejectionReason,
    example: GateRejectionReason.SEAL_DIVERGENCE,
  })
  @IsEnum(GateRejectionReason)
  reason: GateRejectionReason;

  @ApiProperty({
    description: 'Observação do porteiro',
    required: false,
  })
  @IsString()
  @IsOptional()
  observation?: string;

  // Propriedade "virtual" para o Swagger entender o upload
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Foto da evidência (Obrigatória se SEAL_DIVERGENCE)',
    required: false
  })
  @IsOptional()
  file?: any;
}