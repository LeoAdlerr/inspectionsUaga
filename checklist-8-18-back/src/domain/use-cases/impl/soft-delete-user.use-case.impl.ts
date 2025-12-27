import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SoftDeleteUserUseCase } from '../soft-delete-user.use-case';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';

@Injectable()
export class SoftDeleteUserUseCaseImpl implements SoftDeleteUserUseCase {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(id: number): Promise<void> {
    // 1. Verifica se o usuário existe antes de tentar desativá-lo
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }

    // 2. Pede ao repositório para atualizar o usuário, definindo-o como inativo
    await this.userRepository.update(id, { isActive: false });
  }
}