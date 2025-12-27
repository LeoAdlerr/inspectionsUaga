import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ChangePasswordUseCase } from '../change-password.use-case';
import { ChangePasswordDto } from 'src/api/dtos/change-password.dto';
import { UserRepositoryPort } from 'src/domain/repositories/user.repository.port';

@Injectable()
export class ChangePasswordUseCaseImpl implements ChangePasswordUseCase {
    constructor(
        @Inject(UserRepositoryPort)
        private readonly userRepository: UserRepositoryPort,
    ) { }

    async execute(userId: number, dto: ChangePasswordDto): Promise<void> {
        // Usamos findByIdWithAuthDetails para buscar o hash da senha
        const user = await this.userRepository.findByIdWithAuthDetails(userId);
        if (!user) {
            throw new NotFoundException(`Usuário com ID "${userId}" não encontrado.`);
        }

        const isOldPasswordCorrect = await bcrypt.compare(
            dto.oldPassword,
            user.passwordHash,
        );
        if (!isOldPasswordCorrect) {
            throw new UnauthorizedException('A senha antiga está incorreta.');
        }

        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(dto.newPassword, saltRounds);

        await this.userRepository.update(userId, { passwordHash: newPasswordHash });
    }
}