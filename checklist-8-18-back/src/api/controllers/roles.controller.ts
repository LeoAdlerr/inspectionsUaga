import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { FindLookupsByTypeUseCase } from 'src/domain/use-cases/find-lookups-by-type.use-case';
import { Role, RoleName } from 'src/domain/models/role.model'; // Importamos RoleName
import { Lookup } from 'src/domain/models/lookup.model'; // Importamos Lookup

@ApiTags('User Management')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
    constructor(
        @Inject(FindLookupsByTypeUseCase)
        private readonly findLookupsByTypeUseCase: FindLookupsByTypeUseCase,
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Lista todos os papéis (roles) de usuário disponíveis no sistema.' })
    @ApiResponse({ status: 200, description: 'Lista de papéis retornada com sucesso.', type: [Role] })
    async findAll(): Promise<Role[]> {
        const lookups = await this.findLookupsByTypeUseCase.execute('roles');

        //  Mapeamos o resultado genérico para o tipo específico 'Role'
        return lookups.map(lookup => {
            const role = new Role();
            role.id = lookup.id;
            role.name = lookup.name as RoleName; // Fazemos um "type assertion"
            return role;
        });
    }
}