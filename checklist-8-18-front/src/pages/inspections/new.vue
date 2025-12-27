<template>
  <v-container>
    <v-card max-width="900px" class="mx-auto pa-sm-4" elevation="2">
      <v-card-title class="text-h5 font-weight-bold">
        Dados Gerais da Inspeção
      </v-card-title>

      <v-card-text class="mt-4">
        <v-form ref="formRef" @submit.prevent="submitForm">
          
          <p class="text-overline text-primary font-weight-bold mb-2">Identificação</p>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field 
                v-model="form.driverName" 
                :rules="[rules.required]" 
                label="Nome do Motorista *" 
                variant="outlined" 
                density="compact" 
                data-testid="driver-name-input"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field 
                v-model="form.transportDocument" 
                label="Documento Transporte (Opcional)" 
                placeholder="CTe / AWB"
                variant="outlined" 
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field 
                v-model="form.entryRegistration" 
                :rules="[rules.required]" 
                label="Registro de Entrada (RE) *" 
                variant="outlined" 
                density="compact"
                @input="toUpperCase('entryRegistration')"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field 
                v-model="form.vehiclePlates" 
                :rules="[rules.required]" 
                label="Placa do Veículo *" 
                variant="outlined" 
                density="compact"
                @input="toUpperCase('vehiclePlates')"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <p class="text-overline text-primary font-weight-bold mb-2">Dados da Operação</p>
          
          <v-alert type="info" variant="tonal" density="compact" icon="mdi-information-outline" class="text-left mb-4">
            <p class="font-weight-bold mb-1">Nota sobre Modalidade:</p>
            <ul class="pl-4 text-caption">
              <li><strong>Rodoviário:</strong> Checklist de 18 pontos.</li>
              <li><strong>Marítimo/Aéreo:</strong> Checklist de 11 pontos.</li>
            </ul>
          </v-alert>

          <v-row>
            <v-col cols="12" sm="6" md="4">
              <v-select 
                v-model="form.modalityId" 
                :rules="[rules.required]" 
                :items="modalities" 
                item-title="name" 
                item-value="id" 
                label="Modalidade *" 
                variant="outlined" 
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-select 
                v-model="form.operationTypeId" 
                :rules="[rules.required]" 
                :items="operationTypes" 
                item-title="name" 
                item-value="id" 
                label="Operação *" 
                variant="outlined" 
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-select 
                v-model="form.unitTypeId" 
                :rules="[rules.required]" 
                :items="unitTypes" 
                item-title="name" 
                item-value="id" 
                label="Tipo de Unidade *" 
                variant="outlined" 
                density="compact"
              ></v-select>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field 
                v-model="form.containerNumber" 
                :rules="[rules.required]" 
                label="Nº Container / Identificação *" 
                placeholder="ABCD1234567"
                variant="outlined" 
                density="compact"
                @input="toUpperCase('containerNumber')"
                hint="Padrão: 4 letras + 7 números"
                persistent-hint
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-select 
                v-model="form.containerTypeId" 
                :items="containerTypes" 
                item-title="name" 
                item-value="id" 
                label="Tipo de Contêiner (Opcional)" 
                variant="outlined" 
                density="compact" 
                clearable
              ></v-select>
            </v-col>
          </v-row>

          </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="router.back()">Cancelar</v-btn>
        <v-btn color="primary" size="large" variant="elevated" :loading="isLoading" @click="submitForm" :block="mobile">
          Iniciar Checklist
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { useDisplay } from 'vuetify';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';
import type { CreateInspectionDto } from '@/models';
import type { VForm } from 'vuetify/components';

const { mobile } = useDisplay();
const router = useRouter();

const inspectionsStore = useInspectionsStore();
const { isLoading, modalities, operationTypes, unitTypes, containerTypes } = storeToRefs(inspectionsStore);

const formRef = ref<VForm | null>(null);

// Inicialização (Campos de medida removidos)
const form = reactive<CreateInspectionDto>({
  driverName: '',
  entryRegistration: '',
  vehiclePlates: '',
  containerNumber: '', 
  transportDocument: '',
  modalityId: null as any,
  operationTypeId: null as any,
  unitTypeId: null as any,
  containerTypeId: undefined,
  // verifiedLength/Width/Height removidos
});

// Regras de validação
const rules = {
  required: (value: any) => !!value || 'Este campo é obrigatório.',
  containerFormat: (value: string) => {
    if (!value) return true;
    const regex = /^[A-Z]{4}\d{7}$/;
    return regex.test(value) || 'Formato inválido. Esperado: 4 letras + 7 números.';
  }
};

// Helper para caixa alta
const toUpperCase = (field: keyof CreateInspectionDto) => {
  if (typeof form[field] === 'string') {
    (form[field] as string) = (form[field] as string).toUpperCase();
  }
};

const submitForm = async () => {
  const { valid } = await formRef.value?.validate() ?? { valid: false };
  if (!valid) return;

  const newInspection = await inspectionsStore.createInspection(form);
  if (newInspection) {
    router.push(`/`);
  }
};

onMounted(async () => {
  await inspectionsStore.fetchFormLookups();
});
</script>