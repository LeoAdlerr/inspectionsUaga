import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateSealDto {
  @ApiPropertyOptional({
    description: 'Novo número do lacre (se fornecido, substitui o anterior)',
    example: 'L-UAGA-001-CORRIGIDO',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  sealNumber?: string;
}