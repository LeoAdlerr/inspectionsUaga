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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
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
import { RejectGateDto } from '../dtos/reject-gate.dto'; 

// Use Cases
import { GetGateQueueUseCase } from 'src/domain/use-cases/get-gate-queue.use-case';
import { RegisterGateExitUseCase } from 'src/domain/use-cases/register-gate-exit.use-case';
import { RejectGateInspectionUseCase } from 'src/domain/use-cases/reject-gate-inspection.use-case'; 
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Gate (Portaria)')
@Controller('gate')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GateController {
  constructor(
    private readonly getQueueUseCase: GetGateQueueUseCase,
    private readonly registerExitUseCase: RegisterGateExitUseCase,
    // Injeção do Use Case de Rejeição
    private readonly rejectInspectionUseCase: RejectGateInspectionUseCase,
  ) { }

  // 1. Rota de Listagem (Fila)
  @Get('queue')
  @Roles(RoleName.PORTARIA, RoleName.ADMIN)
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

  // 2. Rota de Registro de Saída (Ação Final - Sucesso)
  @Post('exit/:id')
  @Roles(RoleName.PORTARIA, RoleName.ADMIN)
  @ApiOperation({
    summary: 'Registrar saída física (Gate Out)',
    description: 'Finaliza a inspeção (Status 11), registra data de saída e valida lacres.',
  })
  async registerExit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegisterGateExitDto,
    @Req() req: any,
  ): Promise<Inspection> {
    // Extrai o ID do usuário logado
    const userId = req.user?.id || req.user?.userId;

    return this.registerExitUseCase.execute(id, userId, dto);
  }

  // 3. Rota de Rejeição (Ação de Correção - Erro)
  @Post('reject/:id')
  @Roles(RoleName.PORTARIA, RoleName.ADMIN)
  @ApiOperation({ 
    summary: 'Rejeitar saída',
    description: 'Devolve para Correção (14) ou Lacração (9). Exige foto se for divergência de lacre.'
  })
  @ApiConsumes('multipart/form-data') // Importante para Swagger
  @UseInterceptors(FileInterceptor('file')) // Captura o campo "file"
  async rejectExit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectGateDto,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Inspection> {
    const userId = req.user?.id || req.user?.userId;
    return this.rejectInspectionUseCase.execute(id, userId, dto, file);
  }
}