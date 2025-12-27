import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateInspectionImageDto {
  @ApiPropertyOptional({
    description: 'Nova descrição para a imagem (ex: "Foto da placa traseira")',
    example: 'Placa corrigida',
  })
  @IsOptional()
  @IsString()
  description?: string;
}