import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, NotEquals } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'A senha atual do usuário para verificação.',
    example: 'senhaAntiga123',
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    description: 'A nova senha para o usuário. Deve ter no mínimo 8 caracteres.',
    example: 'novaSenhaForte456',
  })
  @IsString()
  @MinLength(8, { message: 'A nova senha deve ter no mínimo 8 caracteres.' })
  @NotEquals('oldPassword', { message: 'A nova senha não pode ser igual à antiga.'})
  newPassword: string;
}