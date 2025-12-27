import { Controller, Post, Body, UseGuards, Inject, Get, Query, Param, ParseIntPipe, NotFoundException, Patch, HttpStatus, HttpCode, Delete, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { CreateUserUseCase } from 'src/domain/use-cases/create-user.use-case';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RoleName } from 'src/domain/models/role.model';
import { User } from 'src/domain/models/user.model';
import { FindAllUsersUseCase } from 'src/domain/use-cases/find-all-users.use-case';
import { FindUserByIdUseCase } from 'src/domain/use-cases/find-user-by-id.use-case';
import { UpdateUserUseCase } from 'src/domain/use-cases/update-user.use-case';
import { ResetPasswordUseCase } from 'src/domain/use-cases/reset-password.use-case';
import { SoftDeleteUserUseCase } from 'src/domain/use-cases/soft-delete-user.use-case';
import { UploadUserSignatureUseCase } from 'src/domain/use-cases/upload-user-signature.use-case';
import { DeleteUserSignatureUseCase } from 'src/domain/use-cases/delete-user-signature.use-case';
import { StartLoadingUseCase } from 'src/domain/use-cases/start-loading.use-case';
import { Inspection } from '@domain/models/inspection.model';


@ApiTags('User Management')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    @Inject(CreateUserUseCase)
    private readonly createUserUseCase: CreateUserUseCase,
    @Inject(FindAllUsersUseCase)
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    @Inject(FindUserByIdUseCase)
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    @Inject(UpdateUserUseCase)
    private readonly updateUserUseCase: UpdateUserUseCase,
    @Inject(ResetPasswordUseCase)
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    @Inject(SoftDeleteUserUseCase)
    private readonly softDeleteUserUseCase: SoftDeleteUserUseCase,
    @Inject(UploadUserSignatureUseCase)
    private readonly uploadUserSignatureUseCase: UploadUserSignatureUseCase,
    @Inject(DeleteUserSignatureUseCase)
    private readonly deleteUserSignatureUseCase: DeleteUserSignatureUseCase,
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard) // Protegido: apenas usuários logados podem ver a lista
  @ApiOperation({ summary: 'Lista usuários com filtros opcionais' })
  @ApiQuery({ name: 'role', required: false, enum: RoleName, description: 'Filtra usuários por um papel (ex: INSPECTOR)' })
  @ApiQuery({ name: 'name', required: false, description: 'Filtra usuários por nome' })
  async findAll(@Query('role') role?: RoleName, @Query('name') name?: string) {
    return this.findAllUsersUseCase.execute({ role, name });
  }

  @Post()
  //@UseGuards(JwtAuthGuard, RolesGuard) desativado o guard para podermos criar os novos users
  //@Roles(RoleName.ADMIN) talvez seja interessante criarmos um endpoint que usuarios admins não podem ser criados e sem roleguard
  @ApiOperation({ summary: 'Cria um novo usuário (Apenas Admins)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado. Apenas para Admins.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Post('my-signature')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('signature'))
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Faz o upload da assinatura do usuário logado.' })
  @ApiResponse({ status: 200, description: 'Assinatura salva com sucesso.' })
  async uploadMySignature(
    @Req() req: { user: { userId: number } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { userId } = req.user;
    return this.uploadUserSignatureUseCase.execute(userId, file);
  }

  @Delete('my-signature')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apaga a assinatura do usuário logado.' })
  @ApiResponse({ status: 200, description: 'Assinatura apagada com sucesso.' })
  async deleteMySignature(
    @Req() req: { user: { userId: number } },
  ) {
    const { userId } = req.user;
    return this.deleteUserSignatureUseCase.execute(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN) // Apenas Admins podem ver detalhes de um usuário específico
  @ApiOperation({ summary: 'Busca um único usuário pelo ID (Apenas Admins)' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.findUserByIdUseCase.execute(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }
    return user;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Atualiza um usuário (Apenas Admins)' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiResponse({ status: 409, description: 'Conflito de dados (username ou email já em uso).' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Desativa um usuário (soft delete) (Apenas Admins)' })
  @ApiResponse({ status: 204, description: 'Usuário desativado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async softDelete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.softDeleteUserUseCase.execute(id);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT) // Define o status de sucesso como 204
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Redefine a senha de um usuário (Apenas Admins)' })
  @ApiResponse({ status: 204, description: 'Senha redefinida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    return this.resetPasswordUseCase.execute(id, resetPasswordDto);
  }
}