import { IsString, IsInt, IsOptional, IsNumber, IsDateString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInspectionChecklistItemDto {
  @ApiPropertyOptional({
    description: 'ID do novo status do item. Valores permitidos: 2 (CONFORME), 3 (NAO_CONFORME), 4 (N_A). Obrigatório exceto para inspeções reprovadas.',
    example: 2,
  })
  @IsInt()
  @IsIn([2, 3, 4])
  @IsOptional() // TORNAR OPCIONAL
  statusId?: number;

  @ApiPropertyOptional({
    description: 'Observações sobre o item inspecionado.',
    example: 'Pequena avaria na lateral esquerda, necessita de reparo.',
  })
  @IsString()
  @IsOptional()
  observations?: string;
}