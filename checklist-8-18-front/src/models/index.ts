// Este arquivo atua como um "barril", exportando todos os tipos e interfaces
// dos outros arquivos na pasta. Isso nos permite importá-los de forma
// centralizada com 'import { ... } from "@/models";'.

export * from './inspection.model';
export * from './lookup.model';
export * from './create-inspection.dto';
export * from './update-inspection-checklist-item.dto';
export * from './update-inspection.dto';
export * from './auth.model';
export * from './attach-driver-signature.dto';
export * from './finalize-inspection.dto';
export * from './inspection-flow.dto';
export * from './attach-signatures.dto';
export * from './attach-driver-signature.dto';
export * from './gate.dto';

// Adicione uma linha 'export * from ...' para cada novo arquivo de modelo que criar no futuro.