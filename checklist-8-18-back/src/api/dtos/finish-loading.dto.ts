import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FinishLoadingDto {
  @ApiProperty({
    description: 'Define se a carga possui precinto (true/false).',
    type: Boolean,
    example: true,
  })
  @IsNotEmpty({ message: 'O campo hasPrecinto é obrigatório.' })
  @IsBoolean({ message: 'O campo hasPrecinto deve ser um booleano.' })
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const sanitized = value.trim().toLowerCase();
      if (sanitized === 'true' || sanitized === '1') return true;
      if (sanitized === 'false' || sanitized === '0') return false;
    }
    return value;
  })
  hasPrecinto: boolean;

  @ApiProperty({ description: 'Lista de números dos lacres finais.' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  // Corrige caso o FormData envie array como string única
  @Transform(({ value }) => {
     if (typeof value === 'string') return [value];
     return value;
  })
  finalSealNumbers: string[];
}