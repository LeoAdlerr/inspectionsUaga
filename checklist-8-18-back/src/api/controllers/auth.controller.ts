import { Controller, Post, Patch, Body, Request, UseGuards, Inject, HttpCode, HttpStatus, Get, NotFoundException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from 'src/modules/auth/auth.service';
import { LocalAuthGuard } from 'src/modules/auth/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { LoginDto } from '../dtos/login.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { User } from 'src/domain/models/user.model';
import { ChangePasswordUseCase } from 'src/domain/use-cases/change-password.use-case';
import { GetMeUseCase } from 'src/domain/use-cases/get-me.use-case';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(ChangePasswordUseCase)
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    @Inject(GetMeUseCase)
    private readonly getMeUseCase: GetMeUseCase,
  ) { }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna os dados completos do usuário autenticado.' })
  @ApiResponse({ status: 200, description: 'Dados do usuário retornados com sucesso.'})
  @ApiResponse({ status: 401, description: 'Não autorizado.'})
  async getMe(@Request() req: { user: { userId: number } }) {
    const user = await this.getMeUseCase.execute(req.user.userId);
    if (!user) {
        throw new NotFoundException('Usuário autenticado não encontrado no sistema.');
    }
    return user;
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza o login do usuário e retorna um token JWT.' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  @ApiResponse({ status: 403, description: 'Usuário desativado.' })
  async login(@Request() req: { user: User }) {
    return this.authService.login(req.user);
  }

  @Patch('change-my-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Permite ao usuário autenticado alterar a sua própria senha.' })
  @ApiResponse({ status: 204, description: 'Senha alterada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado ou senha antiga incorreta.' })
  async changeMyPassword(
    @Request() req: { user: { userId: number } },
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { userId } = req.user;
    return this.changePasswordUseCase.execute(userId, changePasswordDto);
  }
}