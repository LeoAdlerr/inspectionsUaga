import { ApiProperty } from '@nestjs/swagger';
// 1. Importar o IsOptional
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO para o endpoint de finalização da inspeção.
 * Contém os dados de lacre enviados juntamente com as fotos.
 */
export class FinalizeInspectionDto {

  @ApiProperty({
    description: 'Nº do lacre UAGA pós-inspeção.',
    example: 'UAGA-123456',
  })
  @IsString()
  sealUagaPostInspection: string;
}