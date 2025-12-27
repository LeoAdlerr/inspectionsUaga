<template>
  <v-layout>
    <v-app-bar color="secondary" density="compact">
      <v-btn icon="mdi-arrow-left" @click="router.back()"></v-btn>
      <v-app-bar-title>Lacração Inicial</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container>

        <v-card class="mb-6 border-s-lg border-primary" elevation="1">
          <v-card-text>
            <div class="text-overline text-secondary font-weight-bold">
              Checklist #{{ currentInspection?.id }}
            </div>
            <div class="text-h6">
              {{ currentInspection?.containerNumber || 'Carga Solta / Baú' }}
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Etapa final do Inspetor: Assine, insira o lacre e envie.
            </div>
          </v-card-text>
        </v-card>

        <v-card class="mb-6" variant="outlined" :color="hasInspectorSignature ? 'success' : 'warning'">
          <v-card-item>
            <template v-slot:prepend>
              <v-icon :icon="hasInspectorSignature ? 'mdi-check-decagram' : 'mdi-draw'" size="large"></v-icon>
            </template>
            <v-card-title>Assinatura do Inspetor</v-card-title>
            <v-card-subtitle>
              {{ hasInspectorSignature ? 'Assinatura registrada.' : 'Obrigatório para prosseguir.' }}
            </v-card-subtitle>
            <template v-slot:append>
              <v-btn 
                v-if="!hasInspectorSignature" 
                color="warning" 
                variant="elevated" 
                @click="showInspectorModal = true"
              >
                Assinar
              </v-btn>
              <v-chip v-else color="success" size="small">OK</v-chip>
            </template>
          </v-card-item>
        </v-card>

        <v-divider class="mb-6"></v-divider>

        <div class="mb-8">
          <div class="d-flex justify-space-between align-center mb-2">
            <h3 class="text-subtitle-1 font-weight-bold d-flex align-center">
              <v-icon start color="primary" icon="mdi-barcode"></v-icon>
              Lacres ({{ sealsList.length }}/3)
            </h3>
            <span class="text-caption text-error" v-if="sealsList.length === 0">* Mínimo 1</span>
          </div>

          <v-slide-y-transition group>
            <v-card v-for="(seal, index) in sealsList" :key="seal.id" class="mb-2 border" variant="outlined">
              <div class="d-flex align-center pa-2">
                <v-avatar rounded="0" size="50" class="mr-3 bg-grey-lighten-4">
                  <v-img :src="seal.preview" cover></v-img>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="font-weight-bold text-h6">{{ seal.number }}</div>
                  <div class="text-caption text-medium-emphasis">Foto anexada</div>
                </div>
                <v-btn icon="mdi-delete" variant="text" color="error" @click="removeSeal(index)"></v-btn>
              </div>
            </v-card>
          </v-slide-y-transition>

          <v-card v-if="sealsList.length < 3" class="mt-2 bg-grey-lighten-5" elevation="0" border>
            <v-card-text>
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    v-model="tempSealNumber"
                    label="Número do Lacre"
                    variant="outlined"
                    density="compact"
                    bg-color="white"
                    prepend-inner-icon="mdi-pound"
                    @input="tempSealNumber = tempSealNumber.toUpperCase()"
                    placeholder="Ex: UAGA-123"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-file-input
                    v-model="tempSealFile"
                    label="Foto do Lacre"
                    variant="outlined"
                    density="compact"
                    bg-color="white"
                    prepend-icon="mdi-camera"
                    accept="image/*"
                    capture="environment"
                    show-size
                  ></v-file-input>
                </v-col>
                
                <v-col cols="12" v-if="tempSealPreview">
                   <v-img :src="tempSealPreview" height="150" class="rounded border bg-white mb-2" contain></v-img>
                </v-col>

                <v-col cols="12">
                  <v-btn block color="primary" variant="tonal" @click="addSealToList" :disabled="!canAddSeal">
                    <v-icon start>mdi-plus</v-icon> Adicionar à Lista
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>

        <v-divider class="mb-6"></v-divider>

        <div class="mb-8">
          <div class="d-flex justify-space-between align-center mb-2">
            <h3 class="text-subtitle-1 font-weight-bold d-flex align-center">
              <v-icon start color="primary" icon="mdi-truck"></v-icon>
              Fotos da Placa/Geral ({{ platesList.length }}/3)
            </h3>
            <span class="text-caption text-error" v-if="platesList.length === 0">* Mínimo 1</span>
          </div>

          <v-row dense>
            <v-col v-for="(plate, index) in platesList" :key="plate.id" cols="4">
              <v-card class="border position-relative" height="100">
                <v-img :src="plate.preview" height="100%" cover></v-img>
                <v-btn 
                  icon="mdi-close" size="x-small" color="error" variant="elevated" 
                  class="position-absolute top-0 right-0 ma-1"
                  @click="removePlate(index)"
                ></v-btn>
              </v-card>
            </v-col>
          </v-row>
          
          <v-card v-if="platesList.length < 3" class="mt-3 bg-grey-lighten-5" elevation="0" border>
            <v-card-text>
              <v-file-input
                v-model="tempPlateFile"
                label="Foto da Placa"
                variant="outlined"
                density="compact"
                bg-color="white"
                prepend-icon="mdi-camera"
                accept="image/*"
                capture="environment"
                show-size
              ></v-file-input>

               <v-img 
                v-if="tempPlatePreview" 
                :src="tempPlatePreview" 
                height="150" 
                class="rounded border bg-white mb-3"
                contain
              ></v-img>

              <v-btn block color="primary" variant="tonal" @click="addPlateToList" :disabled="!canAddPlate">
                <v-icon start>mdi-plus</v-icon> Adicionar Foto
              </v-btn>
            </v-card-text>
          </v-card>
        </div>

        <div class="pb-6">
          <v-btn 
            block 
            size="x-large" 
            color="success" 
            @click="handleSubmit" 
            :loading="isSubmitting"
            :disabled="!isGatekeeperPassed"
            elevation="4"
          >
            <v-icon start>mdi-send-check</v-icon>
            Enviar para Conferência
          </v-btn>
          
          <v-slide-y-transition>
            <div class="text-center text-caption mt-3 text-error font-weight-medium d-flex flex-column" v-if="!isGatekeeperPassed">
              <span v-if="!hasInspectorSignature">• Necessário assinatura do inspetor.</span>
              <span v-if="sealsList.length === 0">• Adicione pelo menos 1 lacre.</span>
              <span v-if="platesList.length === 0">• Adicione pelo menos 1 foto da placa/geral.</span>
            </div>
          </v-slide-y-transition>
        </div>

      </v-container>
    </v-main>

    <SignatureModal 
      v-model="showInspectorModal" 
      title="Assinatura do Inspetor" 
      label="Eu, Inspetor, confirmo que realizei a lacração."
      @save="handleInspectorSignatureSave" 
      @close="showInspectorModal = false" 
    />

  </v-layout>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';
import SignatureModal from '@/components/SignatureModal.vue';

// Interfaces para a Lista Visual
interface UISeal {
  id: number;
  number: string;
  file: File;
  preview: string;
}
interface UIPlate {
  id: number;
  file: File;
  preview: string;
}

const router = useRouter();
const route = useRoute();
const store = useInspectionsStore();
const { currentInspection, isSubmitting } = storeToRefs(store);

// --- ESTADO DAS LISTAS FINAIS ---
const sealsList = ref<UISeal[]>([]);
const platesList = ref<UIPlate[]>([]);

// --- INPUTS TEMPORÁRIOS (Simples Refs, não Reactive Complexo) ---
const tempSealNumber = ref('');
const tempSealFile = ref<File | null>(null); // Usa File | null, não array
const tempPlateFile = ref<File | null>(null); // Usa File | null, não array

// --- ESTADO DA ASSINATURA ---
const showInspectorModal = ref(false);
const inspectorSignedLocally = ref(false);

// --- COMPUTEDS DE PREVIEW (Seguros) ---
const tempSealPreview = computed(() => {
  return tempSealFile.value ? URL.createObjectURL(tempSealFile.value) : null;
});

const tempPlatePreview = computed(() => {
  return tempPlateFile.value ? URL.createObjectURL(tempPlateFile.value) : null;
});

// --- VALIDAÇÕES "POSSO ADICIONAR?" ---
const canAddSeal = computed(() => {
  return tempSealNumber.value.length >= 3 && tempSealFile.value !== null;
});

const canAddPlate = computed(() => {
  return tempPlateFile.value !== null;
});

const hasInspectorSignature = computed(() => {
  return !!currentInspection.value?.inspectorSignaturePath || inspectorSignedLocally.value;
});

// --- GATEKEEPER FINAL ---
const isGatekeeperPassed = computed(() => {
  return hasInspectorSignature.value && sealsList.value.length > 0 && platesList.value.length > 0;
});

// --- ACTIONS ---

const handleInspectorSignatureSave = async (signatureBase64: string) => {
  if (!currentInspection.value) return;
  try {
    await store.attachInspectorSignature(currentInspection.value.id, signatureBase64);
    inspectorSignedLocally.value = true;
    showInspectorModal.value = false;
  } catch (error) {
    alert(`Erro ao salvar assinatura: ${(error as Error).message}`);
  }
};

// Adicionar Lacre à Lista
const addSealToList = () => {
  const file = tempSealFile.value;
  if (!file) return;

  sealsList.value.push({
    id: Date.now(),
    number: tempSealNumber.value,
    file: file,
    preview: URL.createObjectURL(file)
  });

  // Reset
  tempSealNumber.value = '';
  tempSealFile.value = null;
};

const removeSeal = (index: number) => {
  URL.revokeObjectURL(sealsList.value[index].preview);
  sealsList.value.splice(index, 1);
};

// Adicionar Placa à Lista
const addPlateToList = () => {
  const file = tempPlateFile.value;
  if (!file) return;

  platesList.value.push({
    id: Date.now(),
    file: file,
    preview: URL.createObjectURL(file)
  });

  // Reset
  tempPlateFile.value = null;
};

const removePlate = (index: number) => {
  URL.revokeObjectURL(platesList.value[index].preview);
  platesList.value.splice(index, 1);
};

// Enviar Tudo
const handleSubmit = async () => {
  if (!currentInspection.value || !isGatekeeperPassed.value) return;

  // Extrai os dados das listas
  const sealNumbers = sealsList.value.map(s => s.number);
  const sealPhotos = sealsList.value.map(s => s.file);
  const platePhotos = platesList.value.map(p => p.file);

  try {
    await store.performSealInitial(
      { sealNumbers },
      { sealPhotos, platePhotos }
    );

    alert('Lacração concluída com sucesso!');
    router.push('/'); 
  } catch (error) {
    alert(`Erro ao enviar: ${(error as Error).message}`);
  }
};

onMounted(async () => {
  const id = Number(route.params.id);
  if (id) {
    await store.fetchInspectionById(id);
  }
});
</script>