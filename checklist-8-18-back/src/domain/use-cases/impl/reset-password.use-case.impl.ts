import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ResetPasswordUseCase } from '../reset-password.use-case';
import { ResetPasswordDto } from 'src/api/dtos/reset-password.dto';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';

@Injectable()
export class ResetPasswordUseCaseImpl implements ResetPasswordUseCase {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) { }

  async execute(id: number, dto: ResetPasswordDto): Promise<void> {
    // 1. Verifica se o usuário existe
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }

    // 2. Criptografa a nova senha
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(dto.newPassword, saltRounds);

    // 3. Pede ao repositório para atualizar o usuário com o novo hash
    await this.userRepository.update(id, { passwordHash: newPasswordHash });
  }
}