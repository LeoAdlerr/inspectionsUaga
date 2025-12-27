import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsArray, IsInt, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'jsilva' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'joao.silva@uaga.com.br', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'A senha deve ter no mínimo 8 caracteres.', example: 'senhaForte123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'Array com os IDs das roles a serem atribuídas.', example: [3] })
  @IsArray()
  @IsInt({ each: true })
  roleIds: number[];
}