import { Inspection } from '../models/inspection.model';
import { RejectGateDto } from 'src/api/dtos/reject-gate.dto';

export abstract class RejectGateInspectionUseCase {
  abstract execute(
    inspectionId: number, 
    userId: number, 
    dto: RejectGateDto, 
    file?: Express.Multer.File
  ): Promise<Inspection>;
}