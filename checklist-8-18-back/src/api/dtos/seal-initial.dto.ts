import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from 'class-validator';
import { Transform } from 'class-transformer';

export class SealInitialDto {
  @ApiProperty({
    description: 'Lista de números dos lacres (deve corresponder à ordem das fotos enviadas)',
    type: [String],
    example: ['L-123', 'L-456']
  })
  @IsNotEmpty()
  // Transformação necessária pois multipart envia arrays como 'val1,val2' ou repetição de chaves
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value;
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'Pelo menos um número de lacre é obrigatório.' })
  sealNumbers: string[];
}