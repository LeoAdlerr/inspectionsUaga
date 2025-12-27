export interface UpdateInspectionDto {
  inspectorId?: number;
  driverName?: string;
  entryRegistration?: string;
  vehiclePlates?: string;
  transportDocument?: string;
  containerNumber?: string;
  
  verifiedLength?: number;
  verifiedWidth?: number;
  verifiedHeight?: number;
  
  sealUagaPostInspection?: string;
  sealUagaPostLoading?: string;
  sealShipper?: string;
  sealRfb?: string;
  
  sealVerificationResponsibleName?: string;
  sealVerificationDate?: string; // Formato 'AAAA-MM-DD'
  
  sealVerificationRfbStatusId?: number;
  sealVerificationShipperStatusId?: number;
  sealVerificationTapeStatusId?: number;
  
  observations?: string;
  actionTaken?: string;
  
  modalityId?: number;
  operationTypeId?: number;
  unitTypeId?: number;
  containerTypeId?: number;
}