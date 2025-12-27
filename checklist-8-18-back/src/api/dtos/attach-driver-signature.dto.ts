import { ApiProperty } from '@nestjs/swagger';
import { IsDataURI, IsNotEmpty, IsString } from 'class-validator';

export class AttachDriverSignatureDto {
  @ApiProperty({
    description: 'A imagem da assinatura do motorista, codificada em Base64 (com o prefixo, ex: "data:image/png;base64,...").',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
  })
  @IsString()
  @IsDataURI()
  @IsNotEmpty()
  driverSignature: string;
}