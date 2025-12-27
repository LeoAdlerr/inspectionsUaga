import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsArray, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'João da Silva Santos' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: 'joaosilva' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: 'joao.santos@uaga.com.br' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Define se o usuário está ativo no sistema.', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Array com os novos IDs das roles a serem atribuídas.', example: [2, 3] })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  roleIds?: number[];
}