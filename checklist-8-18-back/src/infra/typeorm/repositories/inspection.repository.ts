import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InspectionRepositoryPort } from 'src/domain/repositories/inspection.repository.port';
import { Inspection } from 'src/domain/models/inspection.model';
import { User } from 'src/domain/models/user.model';
import { InspectionEntity } from '../entities/inspection.entity';
import { InspectionChecklistItem } from 'src/domain/models/inspection-checklist-item.model';
import { ItemEvidence } from 'src/domain/models/item-evidence.model';
import { InspectionChecklistItemEntity } from '../entities/inspection-checklist-item.entity';
import { ItemEvidenceEntity } from '../entities/item-evidence.entity';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { Lookup } from '@domain/models/lookup.model';
import { InspectionSeal } from '@domain/models/inspection-seal.model';
import { InspectionImage } from '@domain/models/inspection-image.model';
import { InspectionSealEntity } from '../entities/inspection-seal.entity';
// 1. IMPORTAR A ENTIDADE DE IMAGENS
import { InspectionImageEntity } from '../entities/inspection-image.entity';

@Injectable()
export class InspectionRepository implements InspectionRepositoryPort {
  constructor(
    @InjectRepository(InspectionEntity)
    private readonly inspectionRepo: Repository<InspectionEntity>,
    @InjectRepository(InspectionChecklistItemEntity)
    private readonly itemRepo: Repository<InspectionChecklistItemEntity>,
    @InjectRepository(ItemEvidenceEntity)
    private readonly evidenceRepo: Repository<ItemEvidenceEntity>,
    @InjectRepository(InspectionSealEntity)
    private readonly sealRepo: Repository<InspectionSealEntity>,
    // 2. INJETAR O REPOSITÓRIO DE IMAGENS
    @InjectRepository(InspectionImageEntity)
    private readonly imageRepo: Repository<InspectionImageEntity>,
  ) { }

  async create(inspectionData: Partial<Inspection>): Promise<Inspection> {
    const newInspectionEntity = this.inspectionRepo.create(inspectionData as any);
    // `save` pode retornar um array, mas neste contexto sempre será um só.
    const savedEntity = await this.inspectionRepo.save(newInspectionEntity);

    // Asseguramos ao TypeScript que `savedEntity` é um único objeto
    const singleEntity = Array.isArray(savedEntity) ? savedEntity[0] : savedEntity;

    return this.mapToDomainInspection(singleEntity);
  }

  async updateItemByPoint(
    inspectionId: number,
    pointNumber: number,
    itemData: Partial<InspectionChecklistItem>,
  ): Promise<InspectionChecklistItem | null> {
    const itemToUpdate = await this.itemRepo.findOneBy({
      inspectionId,
      masterPointId: pointNumber,
    });

    if (!itemToUpdate) return null;

    await this.itemRepo.update(itemToUpdate.id, itemData);

    return this.itemRepo.findOne({
      where: { id: itemToUpdate.id },
      relations: {
        masterPoint: true,
        status: true,
      },
    });
  }

  async addEvidenceToItem(
    evidenceData: Partial<ItemEvidence>,
  ): Promise<ItemEvidence> {
    const newEvidence = this.evidenceRepo.create(evidenceData);
    return this.evidenceRepo.save(newEvidence);
  }

  private mapToDomainInspection(entity: InspectionEntity): Inspection {
    const inspectionModel = new Inspection();
    Object.assign(inspectionModel, entity);

    // Mapeamento do Inspetor (Mantido)
    if (entity.inspector) {
      const inspectorModel = new User();
      Object.assign(inspectorModel, entity.inspector);
      inspectionModel.inspector = inspectorModel;
    }

    // Mapeamento do Conferente (Mantido)
    if (entity.conferente) {
      const conferenteModel = new User();
      Object.assign(conferenteModel, entity.conferente);
      inspectionModel.conferente = conferenteModel;
    }

    // Mapeamento de Lacres (Seals) (Mantido)
    if (entity.seals && entity.seals.length > 0) {
      inspectionModel.seals = entity.seals.map(sealEntity => {
        const sealModel = new InspectionSeal();
        Object.assign(sealModel, sealEntity);

        if (sealEntity.stage) {
          const stageLookup = new Lookup();
          Object.assign(stageLookup, sealEntity.stage);
          sealModel.stage = stageLookup;
        }
        return sealModel;
      });
    } else {
      inspectionModel.seals = [];
    }

    // Mapeamento de Imagens (Images) (Mantido)
    if (entity.images && entity.images.length > 0) {
      inspectionModel.images = entity.images.map(imageEntity => {
        const imageModel = new InspectionImage();
        Object.assign(imageModel, imageEntity);

        if (imageEntity.category) {
          const catLookup = new Lookup();
          Object.assign(catLookup, imageEntity.category);
          imageModel.category = catLookup;
        }
        return imageModel;
      });
    } else {
      inspectionModel.images = [];
    }

    // --- (NOVO) Mapeamento de Itens e Evidências ---
    // Essencial para TASK-FIX-02: Transforma as entidades aninhadas em modelos de domínio
    if (entity.items && entity.items.length > 0) {
      inspectionModel.items = entity.items.map(itemEntity => {
        const itemModel = new InspectionChecklistItem();
        Object.assign(itemModel, itemEntity);

        // Mapeia explicitamente as evidências deste item
        if (itemEntity.evidences && itemEntity.evidences.length > 0) {
          itemModel.evidences = itemEntity.evidences.map(evEntity => {
            const evModel = new ItemEvidence();
            Object.assign(evModel, evEntity);
            return evModel;
          });
        } else {
          itemModel.evidences = [];
        }

        // Garante o mapeamento do MasterPoint se necessário
        if (itemEntity.masterPoint) {
          // Object.assign já deve ter cuidado disso, mas se tiver lógica específica, vai aqui
        }

        return itemModel;
      });
    }

    return inspectionModel;
  }

  async findByIdWithItems(inspectionId: number): Promise<Inspection | null> {
    const inspectionEntity = await this.inspectionRepo.findOne({
      where: { id: inspectionId },
      // GARANTIR QUE a relação 'inspector' seja carregada
      relations: ['items', 'inspector'],
    });
    return inspectionEntity ? this.mapToDomainInspection(inspectionEntity) : null;
  }


  async findItemByInspectionAndPoint(
    inspectionId: number,
    pointNumber: number,
  ): Promise<InspectionChecklistItem | null> {
    return this.itemRepo.findOne({
      where: {
        inspectionId: inspectionId,
        masterPointId: pointNumber,
      },
      relations: {
        masterPoint: true,
      },
    });
  }

  private prepareUpdateData(data: Partial<Inspection>): any {
    const result: any = { ...data };

    // Remove propriedades undefined/não enviadas
    Object.keys(result).forEach(key => {
      if (result[key] === undefined) {
        delete result[key];
      }
    });

    // Converte null para undefined nos campos problemáticos
    const problematicFields = [
      'entryRegistration', 'vehiclePlates', 'transportDocument'
    ];

    problematicFields.forEach(field => {
      if (result[field] === null) {
        result[field] = undefined;
      }
    });

    return result;
  }


  async update(
    inspectionId: number,
    inspectionData: Partial<Inspection>,
  ): Promise<void> {
    const cleanData = this.prepareUpdateData(inspectionData);
    await this.inspectionRepo.update(inspectionId, cleanData);
  }

  // 2. ATUALIZAR A CONSULTA (findByIdWithDetails)
  // Este é o método usado pelo Relatório e pelo FinishLoading
  // 2. ATUALIZAR A CONSULTA
  async findByIdWithDetails(inspectionId: number): Promise<Inspection | null> {
    const inspectionEntity = await this.inspectionRepo.findOne({
      where: { id: inspectionId },
      relations: [
        'items',
        'items.masterPoint',
        'items.evidences',
        'inspector',
        'conferente',
        'seals',
        'seals.stage',
        'images',
        'images.category'
      ],
      // Opcional: Garante a ordem dos itens
      order: {
        items: {
          masterPoint: { pointNumber: 'ASC' }
        }
      }
    });

    return inspectionEntity ? this.mapToDomainInspection(inspectionEntity) : null;
  }


  async findAll(): Promise<Inspection[]> {
    const inspectionEntities = await this.inspectionRepo.find({
      relations: {
        inspector: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return inspectionEntities.map(entity => this.mapToDomainInspection(entity));
  }

  async findById(id: number): Promise<Inspection | null> {
    const entity = await this.inspectionRepo.findOne({
      where: { id: id },
      relations: {
        // Relações diretas da Inspeção
        status: true,
        modality: true,
        operationType: true,
        unitType: true,
        containerType: true,
        // GARANTIR QUE a relação 'inspector' seja carregada
        inspector: true,
        items: {
          status: true,
          masterPoint: true,
          evidences: true, // <-- Carrega as evidências de cada item
        },
      },
      order: {
        items: {
          masterPointId: 'ASC', // Ordena os itens por número do ponto
        },
      },
    });

    return entity ? this.mapToDomainInspection(entity) : null;
  }

  async findExistingInspection(inspectionData: CreateInspectionDto): Promise<Inspection | null> {
    const whereClause: any = {
      statusId: 4, // Apenas inspeções "Aguardando Inspeção"
      driverName: inspectionData.driverName,
      modalityId: inspectionData.modalityId,
      operationTypeId: inspectionData.operationTypeId,
      unitTypeId: inspectionData.unitTypeId,
    };

    // Adiciona os campos opcionais à busca somente se eles foram fornecidos
    if (inspectionData.entryRegistration) {
      whereClause.entryRegistration = inspectionData.entryRegistration;
    }
    if (inspectionData.vehiclePlates) {
      whereClause.vehiclePlates = inspectionData.vehiclePlates;
    }
    if (inspectionData.transportDocument) {
      whereClause.transportDocument = inspectionData.transportDocument;
    }
    if (inspectionData.containerTypeId) {
      whereClause.containerTypeId = inspectionData.containerTypeId;
    }
    if (inspectionData.verifiedLength) {
      whereClause.verifiedLength = inspectionData.verifiedLength;
    }
    if (inspectionData.verifiedWidth) {
      whereClause.verifiedWidth = inspectionData.verifiedWidth;
    }
    if (inspectionData.verifiedHeight) {
      whereClause.verifiedHeight = inspectionData.verifiedHeight;
    }

    const existingEntity = await this.inspectionRepo.findOne({
      where: whereClause,
      relations: {
        inspector: true,
      }
    });

    return existingEntity ? this.mapToDomainInspection(existingEntity) : null;
  }

  async delete(id: number): Promise<void> {
    await this.inspectionRepo.delete(id);
  }

  async findEvidenceById(id: number): Promise<ItemEvidence | null> {
    return this.evidenceRepo.findOneBy({ id });
  }

  async deleteEvidence(id: number): Promise<void> {
    await this.evidenceRepo.delete(id);
  }

  async findEvidenceByFileName(
    inspectionId: number,
    pointNumber: number,
    fileName: string,
  ): Promise<ItemEvidenceEntity | null> {
    return this.evidenceRepo.createQueryBuilder('evidence')
      .innerJoin('evidence.checklistItem', 'item')
      .where('item.inspectionId = :inspectionId', { inspectionId })
      .andWhere('item.masterPointId = :pointNumber', { pointNumber })
      .andWhere('evidence.fileName = :fileName', { fileName })
      .getOne();
  }

  async updateSeal(sealId: number, sealData: Partial<InspectionSeal>): Promise<void> {
    await this.sealRepo.update(sealId, sealData);
  }

  // --- 3. IMPLEMENTAÇÃO DO NOVO MÉTODO (TASK-RFB-01) ---
  async addSeal(sealData: Partial<InspectionSeal>): Promise<InspectionSeal> {
    // Cria a entidade a partir do DTO/Partial
    const entity = this.sealRepo.create(sealData);

    // Salva no banco de dados
    const savedEntity = await this.sealRepo.save(entity);

    // Mapeia de volta para o modelo de domínio
    const model = new InspectionSeal();
    Object.assign(model, savedEntity);
    return model;
  }

  async addImage(imageData: Partial<InspectionImage>): Promise<InspectionImage> {
    const entity = this.imageRepo.create(imageData);
    const savedEntity = await this.imageRepo.save(entity);
    const model = new InspectionImage();
    Object.assign(model, savedEntity);
    return model;
  }

  async findByStatus(statusId: number): Promise<Inspection[]> {
    const inspectionEntities = await this.inspectionRepo.find({
      where: { statusId: statusId },
      // Precisamos dos lacres e seus estágios para mostrar na fila da portaria
      relations: [
        'seals',
        'seals.stage'
      ],
      // Ordena pelos mais antigos primeiro (Fila FIFO - First In, First Out)
      // Usamos updatedAt pois é quando o status mudou para "Aguardando Saída"
      order: {
        updatedAt: 'ASC',
      },
    });

    return inspectionEntities.map(entity => this.mapToDomainInspection(entity));
  }
}
