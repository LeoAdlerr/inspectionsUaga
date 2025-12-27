import { ApiProperty } from '@nestjs/swagger';

export class GateQueueItemDto {
  @ApiProperty({ description: 'ID da Inspeção' })
  id: number;

  @ApiProperty({ description: 'Placa do Veículo' })
  vehiclePlates: string;

  @ApiProperty({ description: 'Número do Container' })
  containerNumber: string;

  @ApiProperty({ description: 'Nome do Motorista' })
  driverName: string;

  @ApiProperty({ description: 'Lacre da RFB (Se houver)' })
  rfbSeal: string | null;

  @ApiProperty({ description: 'Lacre do Armador (Se houver)' })
  armadorSeal: string | null;

  @ApiProperty({ description: 'Data de chegada na portaria (Liberação)' })
  releasedAt: Date;
}