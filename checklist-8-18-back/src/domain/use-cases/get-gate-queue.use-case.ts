import { GateQueueItemDto } from 'src/api/dtos/gate-queue-item.dto';

export abstract class GetGateQueueUseCase {
  abstract execute(): Promise<GateQueueItemDto[]>;
}