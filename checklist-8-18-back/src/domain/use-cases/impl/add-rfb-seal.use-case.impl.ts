import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AddRfbSealUseCase, RfbSealFiles } from '../add-rfb-seal.use-case';
import { InspectionRepositoryPort } from '../../repositories/inspection.repository.port';
import { FileSystemPort } from '../../ports/file-system.port';
import { Inspection } from '../../models/inspection.model';
import { AddRfbSealDto } from 'src/api/dtos/add-rfb-seal.dto';
import { InspectionSeal } from '../../models/inspection-seal.model';
import { InspectionImage } from '../../models/inspection-image.model';
import * as path from 'path';

// CONSTANTES DE ESTÁGIO DE LACRE
const STAGE_RFB = 4;
const STAGE_ARMADOR = 5;

// CONSTANTES DE STATUS DA INSPEÇÃO
const STATUS_AGUARDANDO_SAIDA = 13;

// CONSTANTES DE CATEGORIA DE IMAGEM (Conforme SQL TASK-RFB-03)
const CAT_PANORAMIC = 2;       // Usada quando NÃO tem precinto
const CAT_PRECINTO_FRONT = 5;
const CAT_PRECINTO_REAR = 6;
const CAT_PRECINTO_LEFT = 7;
const CAT_PRECINTO_RIGHT = 8;

@Injectable()
export class AddRfbSealUseCaseImpl implements AddRfbSealUseCase {
  private readonly logger = new Logger(AddRfbSealUseCaseImpl.name);

  constructor(
    @Inject(InspectionRepositoryPort)
    private readonly inspectionRepository: InspectionRepositoryPort,
    @Inject(FileSystemPort)
    private readonly fileSystemService: FileSystemPort,
  ) {}

  async execute(
    inspectionId: number,
    dto: AddRfbSealDto,
    files: RfbSealFiles,
  ): Promise<Inspection> {
    this.logger.log(`Iniciando lacração RFB para inspeção ${inspectionId}`);

    // 1. Validar se a inspeção existe e carregar dados
    const inspection = await this.inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw new NotFoundException(`Inspeção ${inspectionId} não encontrada.`);
    }

    // 2. Validar Arquivo Obrigatório (Foto do Lacre RFB - Sempre obrigatória)
    const rfbFile = files.rfbPhoto ? files.rfbPhoto[0] : null;
    if (!rfbFile) {
      throw new BadRequestException('A foto do Lacre RFB é obrigatória.');
    }

    // 3. VALIDAÇÃO CONDICIONAL DE FOTOS (Baseado no banco de dados)
    // O conferente já definiu se tem precinto na etapa anterior
    if (inspection.hasPrecinto) {
        // Regra: Se tem precinto, exige as 4 fotos laterais
        if (
            !files.precintoFront?.length ||
            !files.precintoRear?.length ||
            !files.precintoLeft?.length ||
            !files.precintoRight?.length
        ) {
            throw new BadRequestException(
                'Para inspeções COM precinto (definido na conferência), é obrigatório enviar as 4 fotos do precinto (Frente, Traseira, Esquerda, Direita).'
            );
        }
    } else {
        // Regra: Se não tem precinto, exige a foto panorâmica traseira
        if (!files.noPrecintoPhoto?.length) {
            throw new BadRequestException(
                'Para inspeções SEM precinto, a foto panorâmica traseira é obrigatória.'
            );
        }
    }

    // 4. Persistir Foto RFB no Disco e Banco (Lacre)
    const rfbPath = await this.saveFile(inspectionId, rfbFile, 'seal_rfb');
    
    const rfbSeal: Partial<InspectionSeal> = {
      inspectionId: inspection.id,
      sealNumber: dto.rfbSealNumber,
      photoPath: rfbPath,
      stageId: STAGE_RFB, 
    };
    await this.inspectionRepository.addSeal(rfbSeal);

    // 5. Persistir Foto Armador (Opcional)
    if (files.armadorPhoto && files.armadorPhoto.length > 0) {
      const armadorPath = await this.saveFile(inspectionId, files.armadorPhoto[0], 'seal_armador');
      
      const armadorSeal: Partial<InspectionSeal> = {
        inspectionId: inspection.id,
        sealNumber: dto.armadorSealNumber || 'N/A',
        photoPath: armadorPath,
        stageId: STAGE_ARMADOR,
      };
      await this.inspectionRepository.addSeal(armadorSeal);
    }

    // 6. SALVAR AS EVIDÊNCIAS VISUAIS (Imagens do Precinto ou Panorâmica)
    if (inspection.hasPrecinto) {
        // Salvar as 4 fotos do precinto
        await this.saveAndPersistImage(inspectionId, files.precintoFront![0], CAT_PRECINTO_FRONT, 'Precinto Frente');
        await this.saveAndPersistImage(inspectionId, files.precintoRear![0], CAT_PRECINTO_REAR, 'Precinto Traseira');
        await this.saveAndPersistImage(inspectionId, files.precintoLeft![0], CAT_PRECINTO_LEFT, 'Precinto Lateral Esq');
        await this.saveAndPersistImage(inspectionId, files.precintoRight![0], CAT_PRECINTO_RIGHT, 'Precinto Lateral Dir');
    } else {
        // Salvar a única foto (sem precinto)
        await this.saveAndPersistImage(inspectionId, files.noPrecintoPhoto![0], CAT_PANORAMIC, 'Panorâmica Traseira (Sem Precinto)');
    }

    // 7. Atualizar Status da Inspeção
    await this.inspectionRepository.update(inspectionId, {
      statusId: STATUS_AGUARDANDO_SAIDA,
    });

    this.logger.log(`Inspeção ${inspectionId} atualizada para AGUARDANDO SAÍDA (13). Precinto: ${inspection.hasPrecinto}`);

    // Retorna a inspeção atualizada
    const updatedInspection = await this.inspectionRepository.findById(inspectionId);
    if (!updatedInspection) throw new NotFoundException('Erro ao recuperar inspeção atualizada.');
    
    return updatedInspection;
  }

  // --- MÉTODOS AUXILIARES ---

  /**
   * Salva o arquivo no disco e cria o registro na tabela inspection_images
   */
  private async saveAndPersistImage(
    inspectionId: number, 
    file: Express.Multer.File, 
    categoryId: number, 
    description: string
  ): Promise<void> {
      // Define prefixo baseado na categoria
      const prefix = `img_cat_${categoryId}`;
      
      // Salva no disco
      const savedPath = await this.saveFile(inspectionId, file, prefix);

      // Cria objeto para salvar no banco
      const imageRecord: Partial<InspectionImage> = {
          inspectionId: inspectionId,
          categoryId: categoryId,
          photoPath: savedPath,
          description: description
      };

      // Salva no banco (usando o novo método do repositório)
      await this.inspectionRepository.addImage(imageRecord);
  }

  // Função auxiliar para salvar arquivos com nomenclatura padronizada
  private async saveFile(inspectionId: number, file: Express.Multer.File, prefix: string): Promise<string> {
    const extension = file.originalname.split('.').pop();
    const fileName = `${prefix}_${Date.now()}.${extension}`;
    
    // Pasta: inspections/123/seals (Estamos salvando tudo na mesma pasta 'seals' para simplificar a gestão de pastas por ID)
    // Se preferir separar, pode criar uma subpasta 'evidences'
    const directory = `${inspectionId}/seals`; 

    return await this.fileSystemService.saveFile(directory, fileName, file);
  }
}