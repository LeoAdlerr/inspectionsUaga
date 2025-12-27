import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

export enum OverrideDecision {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT'
}

export class OverrideInspectionDto {
  @ApiProperty({
    description: 'Decisão do Documental: APPROVE (libera com ressalvas) ou REJECT (mantém reprovado e arquiva).',
    enum: OverrideDecision,
    example: 'APPROVE',
  })
  @IsEnum(OverrideDecision)
  @IsNotEmpty()
  decision: OverrideDecision;

  @ApiProperty({
    description: 'Justificativa obrigatória para a decisão.',
    example: 'Carga liberada pois a avaria não compromete a segurança.',
  })
  @IsString()
  @IsNotEmpty({ message: 'A justificativa é obrigatória.' })
  @MinLength(5, { message: 'A justificativa deve ser detalhada.' })
  justification: string;
}