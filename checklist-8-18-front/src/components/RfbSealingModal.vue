<template>
  <v-dialog v-model="isOpen" max-width="800px" persistent scrollable>
    <v-card>
      <v-toolbar color="indigo" density="compact">
        <v-toolbar-title class="text-h6 font-weight-bold text-white">
          <v-icon start color="white">mdi-seal</v-icon>
          Lacração RFB (Documental)
        </v-toolbar-title>
        <v-btn icon="mdi-close" color="white" @click="close"></v-btn>
      </v-toolbar>

      <v-card-text class="pa-4">
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="h-100">
                <v-card-item>
                  <v-card-title class="text-subtitle-2 text-primary font-weight-bold">Lacre RFB (Obrigatório)</v-card-title>
                </v-card-item>
                <v-card-text>
                  <v-text-field
                    v-model="form.rfbSealNumber"
                    label="Número Lacre RFB"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-barcode"
                    :rules="[rules.required]"
                    class="mb-2"
                  ></v-text-field>
                  <v-file-input
                    v-model="files.rfbPhoto"
                    label="Foto Lacre RFB"
                    variant="outlined"
                    density="compact"
                    prepend-icon="mdi-camera"
                    accept="image/*"
                    :rules="[rules.requiredFile]"
                  ></v-file-input>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined" class="h-100">
                <v-card-item>
                  <v-card-title class="text-subtitle-2 font-weight-bold">Lacre Armador (Opcional)</v-card-title>
                </v-card-item>
                <v-card-text>
                  <v-text-field
                    v-model="form.armadorSealNumber"
                    label="Número Lacre Armador"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-barcode"
                    class="mb-2"
                  ></v-text-field>
                  <v-file-input
                    v-model="files.armadorPhoto"
                    label="Foto Lacre Armador"
                    variant="outlined"
                    density="compact"
                    prepend-icon="mdi-camera"
                    accept="image/*"
                  ></v-file-input>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-6"></v-divider>

          <div class="mb-4">
            <h3 class="text-h6 font-weight-bold d-flex align-center">
              <v-icon start :color="hasPrecinto ? 'warning' : 'grey'">
                {{ hasPrecinto ? 'mdi-alert-decagram' : 'mdi-camera-burst' }}
              </v-icon>
              Evidências Panorâmicas
              <v-chip size="small" class="ml-2" :color="hasPrecinto ? 'warning' : 'grey-lighten-1'">
                {{ hasPrecinto ? 'COM PRECINTO (4 Fotos)' : 'SEM PRECINTO (1 Foto)' }}
              </v-chip>
            </h3>
            <p class="text-caption text-medium-emphasis">
              Configuração definida pelo Conferente na etapa anterior.
            </p>
          </div>

          <v-row v-if="hasPrecinto">
            <v-col cols="12" sm="6">
              <v-file-input v-model="files.precintoFront" label="1. Foto Frente (Cavalo) *" 
                variant="outlined" density="compact" prepend-icon="mdi-truck" accept="image/*" :rules="[rules.requiredFile]" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-file-input v-model="files.precintoRear" label="2. Foto Traseira (Portas) *" 
                variant="outlined" density="compact" prepend-icon="mdi-truck-trailer" accept="image/*" :rules="[rules.requiredFile]" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-file-input v-model="files.precintoLeft" label="3. Lateral Esquerda *" 
                variant="outlined" density="compact" prepend-icon="mdi-arrow-left-box" accept="image/*" :rules="[rules.requiredFile]" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-file-input v-model="files.precintoRight" label="4. Lateral Direita *" 
                variant="outlined" density="compact" prepend-icon="mdi-arrow-right-box" accept="image/*" :rules="[rules.requiredFile]" />
            </v-col>
          </v-row>

          <v-row v-else>
            <v-col cols="12">
              <v-file-input 
                v-model="files.noPrecintoPhoto" 
                label="Foto Panorâmica Traseira (Obrigatória) *" 
                variant="outlined" 
                prepend-icon="mdi-camera-rear" 
                accept="image/*" 
                hint="Evidencie que o veículo está lacrado e pronto para saída."
                persistent-hint
                :rules="[rules.requiredFile]"
              />
            </v-col>
          </v-row>

        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 bg-grey-lighten-5">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="close" :disabled="isSubmitting">Cancelar</v-btn>
        <v-btn 
          color="indigo" 
          variant="elevated" 
          @click="handleSubmit" 
          :loading="isSubmitting"
          :disabled="!isFormValid"
        >
          Finalizar Lacração
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';
import type { RfbSealDto } from '@/models/inspection-flow.dto';

const props = defineProps<{
  modelValue: boolean;
  inspection: any; 
}>();

const emit = defineEmits(['update:modelValue', 'success']);
const store = useInspectionsStore();
const { isSubmitting } = storeToRefs(store);

// Regras
const rules = {
  required: (v: string) => !!v || 'Obrigatório',
  requiredFile: (v: any) => !!v || 'Foto obrigatória',
};

// Form Textos
const form = reactive<RfbSealDto>({
  rfbSealNumber: '',
  hasPrecinto: false, // Não usado no envio, mas exigido pela interface DTO
  armadorSealNumber: '',
});

// Arquivos (Refs Simples)
const files = reactive({
  rfbPhoto: null as File | null,
  armadorPhoto: null as File | null,
  // Precinto (True)
  precintoFront: null as File | null,
  precintoRear: null as File | null,
  precintoLeft: null as File | null,
  precintoRight: null as File | null,
  // Sem Precinto (False)
  noPrecintoPhoto: null as File | null,
});

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// [CORREÇÃO] Lógica Condicional Robusta (Tolerante a tipos)
const hasPrecinto = computed(() => {
  if (!props.inspection) return false;
  // Tenta ler a propriedade padrão ou a snake_case (comum em DBs SQL)
  const val = props.inspection.hasPrecinto ?? props.inspection.has_precinto;
  // Aceita boolean true, string 'true' ou numero 1
  return val === true || val === 'true' || val === 1;
});

// Validação Dinâmica
const isFormValid = computed(() => {
  // 1. Lacre RFB sempre obrigatório
  if (!form.rfbSealNumber || form.rfbSealNumber.length < 3) return false;
  if (!files.rfbPhoto) return false;

  // 2. Validação Condicional de Fotos
  if (hasPrecinto.value) {
    // Cenário TRUE: Precisa das 4 fotos
    return !!files.precintoFront && !!files.precintoRear && !!files.precintoLeft && !!files.precintoRight;
  } else {
    // Cenário FALSE: Precisa apenas da panorâmica traseira
    return !!files.noPrecintoPhoto;
  }
});

watch(() => props.modelValue, (val) => {
  if (val) {
    form.rfbSealNumber = '';
    form.armadorSealNumber = '';
    // Limpa todos os arquivos
    Object.keys(files).forEach(k => (files as any)[k] = null);
  }
});

const close = () => isOpen.value = false;

const handleSubmit = async () => {
  if (!isFormValid.value || !props.inspection?.id) return;

  try {
    // Monta o payload de arquivos dinamicamente
    const filesPayload: any = {
      rfbPhoto: Array.isArray(files.rfbPhoto) ? files.rfbPhoto[0] : files.rfbPhoto,
      armadorPhoto: Array.isArray(files.armadorPhoto) ? files.armadorPhoto[0] : files.armadorPhoto,
    };

    if (hasPrecinto.value) {
      filesPayload.precintoFront = Array.isArray(files.precintoFront) ? files.precintoFront[0] : files.precintoFront;
      filesPayload.precintoRear = Array.isArray(files.precintoRear) ? files.precintoRear[0] : files.precintoRear;
      filesPayload.precintoLeft = Array.isArray(files.precintoLeft) ? files.precintoLeft[0] : files.precintoLeft;
      filesPayload.precintoRight = Array.isArray(files.precintoRight) ? files.precintoRight[0] : files.precintoRight;
    } else {
      filesPayload.noPrecintoPhoto = Array.isArray(files.noPrecintoPhoto) ? files.noPrecintoPhoto[0] : files.noPrecintoPhoto;
    }

    await store.submitRfbSeal(
      props.inspection.id,
      { ...form }, 
      filesPayload
    );
    
    emit('success');
    close();
    // Feedback visual (pode ser substituído por um snackbar global)
    // alert('Lacração registrada e fotos enviadas com sucesso!');
  } catch (error) {
    console.error(error);
    alert(`Erro ao enviar: ${(error as Error).message}`);
  }
};
</script>