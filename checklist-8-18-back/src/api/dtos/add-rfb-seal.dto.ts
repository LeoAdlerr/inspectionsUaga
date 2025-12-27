import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddRfbSealDto {
  @ApiProperty({ description: 'Número do Lacre da Receita Federal (RFB)' })
  @IsString()
  @IsNotEmpty({ message: 'O número do lacre RFB é obrigatório.' })
  rfbSealNumber: string;

  @ApiPropertyOptional({ description: 'Número do Lacre do Armador (Opcional)' })
  @IsString()
  @IsOptional()
  armadorSealNumber?: string;
}