<template>
  <v-layout>
    <v-app-bar color="primary" density="compact">
      <v-btn icon="mdi-arrow-left" data-testid="back-btn" @click="router.back()"></v-btn>
      <v-app-bar-title>Revisar e Finalizar Inspeção</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-overlay :model-value="isLoading || isSubmitting" class="align-center justify-center" persistent>
        <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
        <div class="mt-4 text-center">{{ loadingMessage }}</div>
      </v-overlay>

      <v-container v-if="currentInspection && form">
        <v-card max-width="1200px" class="mx-auto" elevation="2" data-testid="finalize-card">
          <v-card-item class="pa-4">
            <div class="d-flex justify-space-between align-center flex-wrap">
              <div>
                <v-card-title class="text-h5 font-weight-bold">Revisão Final</v-card-title>
                <v-card-subtitle>Checklist #{{ currentInspection.id }}</v-card-subtitle>
              </div>
              <div class="d-flex align-center flex-wrap">
                <v-chip :color="finalStatus.color" variant="elevated" size="large" class="ma-2">
                  <v-icon start :icon="finalStatus.icon"></v-icon>
                  Resultado: {{ finalStatus.text }}
                </v-chip>
                <v-btn v-if="!isEditing" color="primary" @click="isEditing = true" data-testid="edit-btn">
                  <v-icon start>mdi-pencil</v-icon>
                  Liberar Edição
                </v-btn>
                <v-btn v-else color="secondary" @click="saveChanges" :loading="isSubmitting" data-testid="save-btn">
                  <v-icon start>mdi-content-save</v-icon>
                  Salvar Alterações
                </v-btn>
              </div>
            </div>
          </v-card-item>
          <v-divider></v-divider>

          <v-card-text>
            <v-form ref="formRef">
              <p class="text-h6 font-weight-medium mb-4">Dados Gerais</p>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field :model-value="currentInspection?.inspector?.fullName || 'N/A'" label="Nome do Inspetor"
                    disabled variant="outlined" density="compact" data-testid="inspector-name-input"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6"><v-text-field v-model="form.driverName" label="Nome do Motorista"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-text-field></v-col>
                <v-col cols="12" sm="4"><v-text-field v-model="form.entryRegistration" label="Registro de Entrada"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-text-field></v-col>
                <v-col cols="12" sm="4">
                  <v-text-field v-model="form.vehiclePlates" label="Placa do Veículo" :readonly="!isEditing"
                    variant="outlined" density="compact" data-testid="vehicle-plates-input"></v-text-field>
                </v-col>
                <v-col cols="12" sm="4"><v-text-field v-model="form.transportDocument" label="Nº Documento Transporte"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-text-field></v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-text-field :model-value="currentInspection?.modality.name" label="Modalidade" readonly disabled
                    variant="outlined" density="compact"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field :model-value="currentInspection?.operationType.name" label="Operação" readonly disabled
                    variant="outlined" density="compact"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field :model-value="currentInspection?.unitType.name" label="Tipo de Unidade" readonly
                    disabled variant="outlined" density="compact"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field :model-value="currentInspection?.containerType?.name || 'N/A'" label="Tipo de Contêiner"
                    readonly disabled variant="outlined" density="compact"></v-text-field>
                </v-col>
              </v-row>
              <v-divider class="my-4"></v-divider>

              <p class="text-h6 font-weight-medium mb-4">Medidas e Lacres</p>
              <v-row>
                <v-col cols="12" sm="4">
                  <v-text-field v-model.number="form.verifiedLength" label="Comprimento (m)" :rules="measurementRules"
                    type="number" :readonly="!isEditing" variant="outlined" density="compact"></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field v-model.number="form.verifiedWidth" label="Largura (m)" :rules="measurementRules"
                    type="number" :readonly="!isEditing" variant="outlined" density="compact"></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field v-model.number="form.verifiedHeight" label="Altura (m)" :rules="measurementRules"
                    type="number" :readonly="!isEditing" variant="outlined" density="compact"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3"><v-text-field v-model="form.sealUagaPostInspection"
                    label="Lacre UAGA (Pós-Inspeção)" :readonly="!isEditing" variant="outlined"
                    density="compact"></v-text-field></v-col>
                <v-col cols="12" sm="6" md="3"><v-text-field v-model="form.sealUagaPostLoading"
                    label="Lacre UAGA (Pós-Carregamento)" :readonly="!isEditing" variant="outlined"
                    density="compact"></v-text-field></v-col>
                <v-col cols="12" sm="6" md="3"><v-text-field v-model="form.sealShipper" label="Lacre Armador"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-text-field></v-col>
                <v-col cols="12" sm="6" md="3"><v-text-field v-model="form.sealRfb" label="Lacre RFB"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-text-field></v-col>
              </v-row>
              <v-divider class="my-4"></v-divider>

              <p class="text-h6 font-weight-medium mb-4">Verificação de Lacres de Saída</p>
              <v-row>
                <v-col cols="12" sm="6"><v-text-field v-model="form.sealVerificationResponsibleName"
                    label="Nome do Responsável" :readonly="!isEditing" variant="outlined"
                    density="compact"></v-text-field></v-col>
                <v-col cols="12" sm="6">
                  <v-menu v-model="dateMenu" :close-on-content-click="false" location="bottom">
                    <template v-slot:activator="{ props }">
                      <v-text-field :model-value="formattedDate" label="Data da Verificação"
                        prepend-inner-icon="mdi-calendar" readonly v-bind="props" :disabled="!isEditing"
                        variant="outlined" density="compact"></v-text-field>
                    </template>
                    <v-date-picker v-model="rawDate" @update:model-value="dateMenu = false" hide-actions title=""
                      color="primary"></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="4"><v-select v-model="form.sealVerificationRfbStatusId"
                    :items="sealVerificationStatuses" item-title="name" item-value="id" label="Status Lacre RFB"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-select></v-col>
                <v-col cols="12" sm="4"><v-select v-model="form.sealVerificationShipperStatusId"
                    :items="sealVerificationStatuses" item-title="name" item-value="id" label="Status Lacre Armador"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-select></v-col>
                <v-col cols="12" sm="4"><v-select v-model="form.sealVerificationTapeStatusId"
                    :items="sealVerificationStatuses" item-title="name" item-value="id" label="Status Fita Lacre"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-select></v-col>
              </v-row>
              <v-divider class="my-4"></v-divider>

              <p class="text-h6 font-weight-medium mb-4">Observações Finais</p>
              <v-row>
                <v-col cols="12" md="6"><v-textarea v-model="form.observations" label="Observações Gerais"
                    :readonly="!isEditing" variant="outlined" rows="4" auto-grow></v-textarea></v-col>
                <v-col cols="12" md="6"><v-textarea v-model="form.actionTaken" label="Providências Tomadas"
                    :readonly="!isEditing" variant="outlined" rows="4" auto-grow></v-textarea></v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-alert v-if="finalStatus.text === 'EM ANÁLISE'" type="warning" variant="tonal" density="compact"
            class="mx-4 mb-4 text-center" icon="mdi-alert-circle-outline"
            text="A inspeção não pode ser finalizada pois existem itens pendentes. 'EM INSPECAO'"></v-alert>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>

            <v-btn size="x-large" color="success" :loading="isSubmitting"
              :disabled="isLoading || isEditing || finalStatus.text === 'EM ANÁLISE'" @click="handleFinalize"
              data-testid="submit-finalize-btn">
              <v-icon start>mdi-file-pdf-box</v-icon>
              Gerar Relatório
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';
import type { UpdateInspectionDto } from '@/models';

const route = useRoute();
const router = useRouter();
const inspectionsStore = useInspectionsStore();
const {
  currentInspection,
  isLoading,
  isSubmitting,
  sealVerificationStatuses
  // 'modalities', 'operationTypes', 'unitTypes', 'containerTypes' removidos
} = storeToRefs(inspectionsStore);

const formRef = ref<any>(null);
const isEditing = ref(false);
const form = reactive<Partial<UpdateInspectionDto>>({});
const loadingMessage = ref('Carregando dados da revisão...');
const dateMenu = ref(false);
const rawDate = ref<Date | null>(null);

const measurementRules = [
  (v: string | number) => {
    if (v === null || v === undefined || v === '') return true;
    if (!/^-?\d+([.,]\d{1,2})?$/.test(String(v))) {
      return 'Formato inválido (ex: 12.34 ou 12,34)';
    }
    if (Number(String(v).replace(',', '.')) >= 100000000) {
      return 'Valor muito alto (máx 8 dígitos antes do separador).'
    }
    return true;
  },
];

const formattedDate = computed(() => {
  return rawDate.value ? rawDate.value.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '';
});

watch(rawDate, (newDate) => {
  if (newDate) {
    form.sealVerificationDate = newDate.toISOString().split('T')[0];
  } else {
    form.sealVerificationDate = undefined;
  }
});

const finalStatus = computed(() => {
  if (!currentInspection.value?.items) {
    return { text: 'Indefinido', color: 'grey', icon: 'mdi-help-circle' };
  }

  const items = currentInspection.value.items;
  const isEmAnalise = items.some(item => item.statusId === 1);
  if (isEmAnalise) {
    return { text: 'EM ANÁLISE', color: 'warning', icon: 'mdi-magnify-scan' };
  }

  const isReprovado = items.some(item => item.statusId === 3);
  if (isReprovado) {
    return { text: 'REPROVADO', color: 'error', icon: 'mdi-close-octagon' };
  }

  return { text: 'APROVADO', color: 'success', icon: 'mdi-check-decagram' };
});

const saveChanges = async () => {
  if (!currentInspection.value) return;
  const { valid } = await formRef.value?.validate() ?? { valid: false };
  if (!valid) return;

  const payload: { [key: string]: any } = { ...form };
  const fieldsToParse: (keyof UpdateInspectionDto)[] = ['verifiedLength', 'verifiedWidth', 'verifiedHeight'];
  for (const field of fieldsToParse) {
    const value = payload[field];
    if (value !== null && value !== undefined && value !== '') {
      payload[field] = parseFloat(String(value).replace(',', '.'));
    }
  }

  loadingMessage.value = 'Salvando alterações...';
  await inspectionsStore.updateInspection(currentInspection.value.id, payload as UpdateInspectionDto);
  isEditing.value = false;
};

const handleFinalize = async () => {
  const inspectionId = Number((route.params as { id: string }).id);

  if (!inspectionId) return;

  if (isEditing.value) {
    alert('Por favor, salve suas alterações antes de finalizar a inspeção.');
    return;
  }

  loadingMessage.value = 'Finalizando inspeção...';
  try {
    router.push(`/inspections/${inspectionId}/report`);
  } catch (error) {
    const errorMessage = (error as any)?.response?.data?.message?.join(', ') || (error as Error).message;
    alert(`Erro ao finalizar: ${errorMessage}`);
  }
};

onMounted(() => {
  const inspectionId = Number((route.params as { id: string }).id);
  inspectionsStore.fetchInspectionById(inspectionId);
  inspectionsStore.fetchSealVerificationStatuses();
});

watch(currentInspection, (newVal) => {
  if (newVal) {
    Object.assign(form, {
      driverName: newVal.driverName,
      entryRegistration: newVal.entryRegistration,
      vehiclePlates: newVal.vehiclePlates,
      transportDocument: newVal.transportDocument,
      verifiedLength: newVal.verifiedLength,
      verifiedWidth: newVal.verifiedWidth,
      verifiedHeight: newVal.verifiedHeight,
      sealUagaPostInspection: newVal.sealUagaPostInspection,
      sealUagaPostLoading: newVal.sealUagaPostLoading,
      sealShipper: newVal.sealShipper,
      sealRfb: newVal.sealRfb,
      sealVerificationResponsibleName: newVal.sealVerificationResponsibleName,
      sealVerificationDate: newVal.sealVerificationDate,
      sealVerificationRfbStatusId: newVal.sealVerificationRfbStatusId,
      sealVerificationShipperStatusId: newVal.sealVerificationShipperStatusId,
      sealVerificationTapeStatusId: newVal.sealVerificationTapeStatusId,
      observations: newVal.observations,
      actionTaken: newVal.actionTaken,
    });
    if (newVal.sealVerificationDate) {
      rawDate.value = new Date(`${newVal.sealVerificationDate}T00:00:00Z`);
    }
  }
}, { immediate: true, deep: true });
</script>