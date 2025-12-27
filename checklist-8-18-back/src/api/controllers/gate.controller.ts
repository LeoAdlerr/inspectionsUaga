import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
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
import { RegisterGateExitDto } from '../dtos/register-gate-exit.dto';

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
  ) { }

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
    description: 'Finaliza a inspeção, registra data de saída e valida lacres.',
  })
  async registerExit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegisterGateExitDto, // 1. Recebe o DTO do corpo
    @Req() req: any,                  // 2. Recebe a Request para pegar o User
  ): Promise<Inspection> {
    // 3. Extrai o ID do usuário (ajuste conforme sua estratégia de JWT, geralmente é req.user.id ou req.user.userId)
    const userId = req.user?.id || req.user?.userId;

    // 4. Passa os 3 argumentos obrigatórios
    return this.registerExitUseCase.execute(id, userId, dto);
  }
}