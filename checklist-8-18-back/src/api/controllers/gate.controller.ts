import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// Guards e Decorators de Auth
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RoleName } from 'src/domain/models/role.model';

// DTOs e Models
import { GateQueueItemDto } from '../dtos/gate-queue-item.dto';
import { Inspection } from 'src/domain/models/inspection.model';

// Use Cases
import { GetGateQueueUseCase } from 'src/domain/use-cases/get-gate-queue.use-case';
import { RegisterGateExitUseCase } from 'src/domain/use-cases/register-gate-exit.use-case';

@ApiTags('Gate (Portaria)')
@Controller('gate')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GateController {
  constructor(
    private readonly getQueueUseCase: GetGateQueueUseCase,
    private readonly registerExitUseCase: RegisterGateExitUseCase,
  ) {}

  // 1. Rota de Listagem (Fila)
  @Get('queue')
  @Roles(RoleName.PORTARIA, RoleName.ADMIN) // Apenas Portaria ou Admin
  @ApiOperation({
    summary: 'Listar fila de saída (Status 13 - Aguardando Saída)',
    description: 'Retorna a lista de veículos liberados pelo Documental aguardando saída física.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista recuperada com sucesso.',
    type: [GateQueueItemDto],
  })
  async getQueue(): Promise<GateQueueItemDto[]> {
    return this.getQueueUseCase.execute();
  }

  // 2. Rota de Registro de Saída (Ação Final)
  @Post('exit/:id')
  @Roles(RoleName.PORTARIA, RoleName.ADMIN)
  @ApiOperation({
    summary: 'Registrar saída física (Gate Out)',
    description: 'Finaliza a inspeção (Status 11), registra data de saída e gera o PDF final.',
  })
  @ApiResponse({
    status: 201,
    description: 'Saída registrada e inspeção finalizada.',
    type: Inspection,
  })
  @ApiResponse({
    status: 400,
    description: 'A inspeção não está no status correto (13) para sair.',
  })
  @ApiResponse({
    status: 404,
    description: 'Inspeção não encontrada.',
  })
  async registerExit(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Inspection> {
    return this.registerExitUseCase.execute(id);
  }
}