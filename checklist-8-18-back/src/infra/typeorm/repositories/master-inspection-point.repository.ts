import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterInspectionPointRepositoryPort } from 'src/domain/repositories/master-inspection-point.repository.port';
import { MasterInspectionPoint } from 'src/domain/models/master-inspection-point.model';
import { MasterInspectionPointEntity } from '../entities/master-inspection-point.entity';

@Injectable()
export class MasterInspectionPointRepository implements MasterInspectionPointRepositoryPort {
  constructor(
    @InjectRepository(MasterInspectionPointEntity)
    private readonly typeormRepo: Repository<MasterInspectionPointEntity>,
  ) {}

  async findAll(): Promise<MasterInspectionPoint[]> {
    return this.typeormRepo.find({ order: { pointNumber: 'ASC' } });
  }

  async findForModality(modalityId: number): Promise<MasterInspectionPoint[]> {
    // Modalidade 1 = RODOVIARIO (Checklist completo de 18 pontos)
    if (modalityId === 1) {
      return this.findAll();
    } 
    // Modalidades 2 e 3 = MARITIMO / AEREO (Checklist de 11 pontos)
    else {
      // Usamos o Query Builder para uma seleção mais complexa:
      // Todos da categoria 'CONTEINER' OU os pontos 11, 14 e 16.
      return this.typeormRepo.createQueryBuilder('point')
        .where('point.category = :category', { category: 'CONTEINER' })
        .orWhere('point.pointNumber IN (:...pointNumbers)', { pointNumbers: [11, 14, 16] })
        .orderBy('point.pointNumber', 'ASC')
        .getMany();
    }
  }
}