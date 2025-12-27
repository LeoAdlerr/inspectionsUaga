import { InspectionChecklistItem } from './inspection-checklist-item.model';
import { InspectionImage } from './inspection-image.model';
import { InspectionSeal } from './inspection-seal.model';
import { Lookup } from './lookup.model';
import { User } from './user.model';

export class Inspection {
  // Propriedades Principais
  id: number;
  inspectorId?: number | null;
  conferenteId?: number | null;
  
  // [NOVO] ID do Operador de Portaria
  gateOperatorId?: number | null;
  
  statusId: number;
  driverName: string;
  
  startDatetime: Date;
  createdAt: Date;
  updatedAt: Date;

  // Timestamps de Fluxo
  inspectionStartedAt?: Date | null;
  endDatetime?: Date | null; // Fim da Inspeção (Ciclo Geral)
  
  conferenceStartedAt?: Date | null; 
  conferenceEndedAt?: Date | null;  

  // Timestamp Exclusivo da Portaria (Gate Out)
  gateOutAt?: Date | null;

  // Propriedades da Inspeção
  entryRegistration: string;
  vehiclePlates: string;
  containerNumber: string;
  hasPrecinto: boolean;
  transportDocument?: string | null;
  
  observations?: string | null;
  actionTaken?: string | null;
  generatedPdfPath?: string | null;

  // Propriedades de Relações (IDs)
  modalityId: number;
  operationTypeId: number;
  unitTypeId: number;
  containerTypeId?: number | null;

  // Propriedades das Medidas Verificadas
  verifiedLength?: number | null;
  verifiedWidth?: number | null;
  verifiedHeight?: number | null;

  // Propriedades dos Lacres (Legado / Compatibilidade)
  sealUagaPostInspection?: string | null;
  sealUagaPostLoading?: string | null;
  sealShipper?: string | null;
  sealRfb?: string | null;

  // Propriedades da Verificação de Lacres (Portaria)
  sealVerificationRfbStatusId?: number | null;
  sealVerificationShipperStatusId?: number | null;
  sealVerificationTapeStatusId?: number | null;
  sealVerificationResponsibleName?: string | null;
  sealVerificationDate?: Date | null;
  sealVerificationSignaturePath?: string | null;

  // Propriedades dos Caminhos de Arquivo (Assinaturas)
  driverSignaturePath?: string | null;
  inspectorSignaturePath?: string | null;
  
  // Caminhos antigos (Mantidos por compatibilidade)
  sealPhotoPath?: string | null; 
  platePhotoPath?: string | null; 

  // Relações com outras entidades (objetos)
  items: InspectionChecklistItem[];
  
  // Lookups
  status?: Lookup;
  modality?: Lookup;
  operationType?: Lookup;
  unitType?: Lookup;
  containerType?: Lookup;
  sealVerificationRfbStatus?: Lookup;
  sealVerificationShipperStatus?: Lookup;
  sealVerificationTapeStatus?: Lookup;
  
  // Usuários
  inspector?: User;
  conferente?: User;
  
  //  Objeto do Operador de Portaria
  gateOperator?: User;

  seals?: InspectionSeal[]; 
  images?: InspectionImage[];
}