import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'O identificador de login (pode ser o username ou o email).',
    example: 'ladler',
  })
  @IsString()
  @IsNotEmpty()
  loginIdentifier: string;

  @ApiProperty({
    description: 'A senha do usuário.',
    example: 'senha123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}