import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class AttachSignaturesDto {
  @ApiPropertyOptional({
    description: 'Se verdadeiro, o backend deve usar a assinatura já salva no perfil do inspetor logado, ignorando qualquer ficheiro enviado no campo `inspectorSignature`.',
    type: 'boolean', // Ajuda o Swagger UI a renderizar o campo corretamente
  })
  @IsOptional()
  @IsBoolean()
  // Transforma a string 'true' ou 'false' de um form-data para um booleano real
  @Transform(({ value }) => value === 'true')
  useProfileSignature?: boolean;
}