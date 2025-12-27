<template>
  <v-layout>
    <v-app-bar color="secondary" density="compact">
      <v-btn icon="mdi-arrow-left" @click="router.back()"></v-btn>
      <v-app-bar-title>Conferência de Carga</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container>

        <v-card class="mb-6 border-s-lg border-info" elevation="1">
          <v-card-text>
            <div class="text-overline text-info font-weight-bold">
              Checklist #{{ currentInspection?.id }}
            </div>
            <div class="text-h6">
              {{ currentInspection?.containerNumber || 'Carga Solta / Baú' }}
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Confira os lacres de chegada e registre o relacre de saída.
            </div>
          </v-card-text>
        </v-card>

        <div class="mb-8" v-if="initialSeals.length > 0">
          <h3 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center text-grey-darken-1">
            <v-icon start icon="mdi-eye-check-outline"></v-icon>
            Lacres de Chegada (Conferir)
          </h3>
          
          <v-slide-y-transition group>
            <v-card v-for="seal in initialSeals" :key="seal.id" class="mb-2 bg-grey-lighten-4" variant="flat" border>
              <div class="d-flex align-center pa-2">
                <v-avatar rounded="0" size="60" class="mr-3 bg-white border cursor-pointer" @click="openImage(seal.photoPath || '')">
                  <v-img :src="`/${seal.photoPath}`" cover></v-img>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="font-weight-bold text-body-1">{{ seal.sealNumber }}</div>
                  <div class="text-caption text-medium-emphasis">Lacre do Inspetor</div>
                </div>
                <v-icon color="success" icon="mdi-check-circle" size="large" class="mr-2"></v-icon>
              </div>
            </v-card>
          </v-slide-y-transition>
        </div>

        <v-divider class="mb-6"></v-divider>

        <div class="mb-8">
          <div class="d-flex justify-space-between align-center mb-2">
            <h3 class="text-subtitle-1 font-weight-bold d-flex align-center">
              <v-icon start color="primary" icon="mdi-barcode-scan"></v-icon>
              Lacres Pós-Carregamento ({{ finalSealsList.length }}/3)
            </h3>
            <span class="text-caption text-error" v-if="finalSealsList.length === 0">* Mínimo 1</span>
          </div>

          <v-slide-y-transition group>
            <v-card v-for="(item, index) in finalSealsList" :key="index" class="mb-2 border" variant="outlined">
              <div class="d-flex align-center pa-2">
                <v-avatar rounded="0" size="50" class="mr-3 bg-grey-lighten-4">
                  <v-img :src="item.preview" cover></v-img>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="font-weight-bold text-h6">{{ item.number }}</div>
                  <div class="text-caption text-medium-emphasis">Novo Lacre</div>
                </div>
                <v-btn icon="mdi-delete" variant="text" color="error" @click="removeFinalSeal(index)"></v-btn>
              </div>
            </v-card>
          </v-slide-y-transition>

          <v-card v-if="finalSealsList.length < 3" class="mt-2 bg-grey-lighten-5" elevation="0" border>
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
                    placeholder="Ex: FINAL-999"
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
                    show-size
                  ></v-file-input>
                </v-col>
                
                <v-col cols="12" v-if="tempSealPreview">
                   <v-img :src="tempSealPreview" height="150" class="rounded border bg-white mb-2" contain></v-img>
                </v-col>

                <v-col cols="12">
                  <v-btn block color="primary" variant="tonal" @click="addFinalSeal" :disabled="!canAddSeal">
                    <v-icon start>mdi-plus</v-icon> Adicionar Lacre
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>

        <div class="mb-8">
          <div class="d-flex justify-space-between align-center mb-2">
            <h3 class="text-subtitle-1 font-weight-bold d-flex align-center">
              <v-icon start color="primary" icon="mdi-camera-burst"></v-icon>
              Panorâmicas ({{ panoramicList.length }}/3)
            </h3>
            <span class="text-caption text-error" v-if="panoramicList.length === 0">* Mínimo 1</span>
          </div>

          <v-row dense>
            <v-col v-for="(item, index) in panoramicList" :key="index" cols="4">
              <v-card class="border position-relative" height="100">
                <v-img :src="item.preview" height="100%" cover></v-img>
                <v-btn 
                  icon="mdi-close" size="x-small" color="error" variant="elevated" 
                  class="position-absolute top-0 right-0 ma-1"
                  @click="removePanoramic(index)"
                ></v-btn>
              </v-card>
            </v-col>
            
            <v-col cols="4" v-if="panoramicList.length < 3">
               <v-sheet 
                 class="d-flex align-center justify-center border border-dashed bg-grey-lighten-4 cursor-pointer" 
                 height="100"
                 @click="triggerPanoramicUpload"
                 v-ripple
               >
                  <div class="text-center">
                    <v-icon icon="mdi-camera-plus" color="primary" size="large"></v-icon>
                    <div class="text-caption text-primary mt-1">Add Foto</div>
                  </div>
               </v-sheet>
               <v-file-input
                 ref="panoramicInputRef"
                 v-model="tempPanoramicFile"
                 class="d-none"
                 accept="image/*"
                 @update:model-value="addPanoramic"
               ></v-file-input>
            </v-col>
          </v-row>
        </div>

        <v-card class="mb-6 border border-warning bg-orange-lighten-5" variant="flat">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-bold text-orange-darken-4">
                  <v-icon start color="orange-darken-4">mdi-lock-smart</v-icon>
                  Precinto Eletrônico
                </div>
                <div class="text-caption text-medium-emphasis">
                  Esta carga exige monitoramento eletrônico (Isca)?
                </div>
              </div>
              
              <v-switch 
                v-model="hasPrecinto" 
                color="orange-darken-3" 
                hide-details 
                inset 
                :label="hasPrecinto ? 'Sim' : 'Não'"
              ></v-switch>
            </div>
            
            <v-expand-transition>
              <div v-if="hasPrecinto" class="text-caption text-orange-darken-4 mt-2 font-weight-medium">
                <v-icon size="small" icon="mdi-alert-circle-outline" start></v-icon>
                O setor Documental será obrigado a anexar 4 fotos do precinto.
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>

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
            <v-icon start>mdi-check-all</v-icon>
            Finalizar Carregamento
          </v-btn>
          
          <v-slide-y-transition>
            <div class="text-center text-caption mt-3 text-error font-weight-medium d-flex flex-column" v-if="!isGatekeeperPassed">
              <span v-if="finalSealsList.length === 0">• Adicione pelo menos 1 lacre pós-carregamento.</span>
              <span v-if="panoramicList.length === 0">• Adicione pelo menos 1 foto panorâmica.</span>
            </div>
          </v-slide-y-transition>
        </div>

      </v-container>
    </v-main>

    <v-dialog v-model="showImageModal" max-width="800">
      <v-card>
        <v-img :src="previewImageUrl" max-height="80vh" contain class="bg-black"></v-img>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showImageModal = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-layout>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';

// Interfaces Locais
interface UISeal { id: number; number: string; file: File; preview: string; }
interface UIPhoto { id: number; file: File; preview: string; }

const router = useRouter();
const route = useRoute();
const store = useInspectionsStore();
const { currentInspection, isSubmitting } = storeToRefs(store);

// --- ESTADO LOCAL ---
const finalSealsList = ref<UISeal[]>([]);
const panoramicList = ref<UIPhoto[]>([]);
const hasPrecinto = ref(false); // [CRÍTICO] Inicializa como false

// --- INPUTS TEMPORÁRIOS ---
const tempSealNumber = ref('');
const tempSealFile = ref<File | null>(null);
const tempPanoramicFile = ref<File | null>(null);
const panoramicInputRef = ref<any>(null); // Ref para o input file hidden

// --- ESTADO VISUALIZAÇÃO ---
const showImageModal = ref(false);
const previewImageUrl = ref('');

// --- DADOS DE CHEGADA (READ-ONLY) ---
const initialSeals = computed(() => {
  return currentInspection.value?.seals?.filter(s => s.stage === 'INITIAL') || [];
});

// --- COMPUTEDS (PREVIEWS) ---
const tempSealPreview = computed(() => {
  const val = tempSealFile.value;
  if (!val) return null;
  if (Array.isArray(val)) return val.length > 0 ? URL.createObjectURL(val[0]) : null;
  return URL.createObjectURL(val as File);
});

// --- VALIDAÇÕES ---
const canAddSeal = computed(() => {
  const hasFile = Array.isArray(tempSealFile.value) ? tempSealFile.value.length > 0 : !!tempSealFile.value;
  return tempSealNumber.value.length >= 3 && hasFile;
});

const isGatekeeperPassed = computed(() => {
  return finalSealsList.value.length > 0 && panoramicList.value.length > 0;
});

// --- ACTIONS ---

const openImage = (path: string) => {
  if (!path) return;
  previewImageUrl.value = `/${path}`;
  showImageModal.value = true;
};

// --- LOGICA DE LACRES ---
const addFinalSeal = () => {
  let file: File | null = null;
  if (Array.isArray(tempSealFile.value)) {
    file = tempSealFile.value[0];
  } else {
    file = tempSealFile.value;
  }
  if (!file) return;

  finalSealsList.value.push({
    id: Date.now(),
    number: tempSealNumber.value,
    file: file,
    preview: URL.createObjectURL(file)
  });

  tempSealNumber.value = '';
  tempSealFile.value = null;
};

const removeFinalSeal = (index: number) => {
  URL.revokeObjectURL(finalSealsList.value[index].preview);
  finalSealsList.value.splice(index, 1);
};

// --- LOGICA DE PANORAMICAS ---
const triggerPanoramicUpload = () => {
  // Acessa o input nativo dentro do componente v-file-input
  panoramicInputRef.value?.$el.querySelector('input')?.click();
};

const addPanoramic = () => {
  let file: File | null = null;
  if (Array.isArray(tempPanoramicFile.value)) {
    file = tempPanoramicFile.value[0];
  } else {
    file = tempPanoramicFile.value;
  }
  if (!file) return;

  panoramicList.value.push({
    id: Date.now(),
    file: file,
    preview: URL.createObjectURL(file)
  });
  
  // Limpa input para permitir selecionar o mesmo arquivo se necessário
  setTimeout(() => { tempPanoramicFile.value = null; }, 100);
};

const removePanoramic = (index: number) => {
  URL.revokeObjectURL(panoramicList.value[index].preview);
  panoramicList.value.splice(index, 1);
};

// --- SUBMIT FINAL ---
const handleSubmit = async () => {
  if (!currentInspection.value || !isGatekeeperPassed.value) return;

  // 1. Preparar Dados
  const finalSealNumbers = finalSealsList.value.map(s => s.number);
  const finalSealPhotos = finalSealsList.value.map(s => s.file);
  const panoramicPhotos = panoramicList.value.map(p => p.file);

  try {
    // 2. Enviar para a Store com o hasPrecinto correto
    await store.finalizeConference(
      { 
        finalSealNumbers, 
        hasPrecinto: hasPrecinto.value // <--- Passa o valor do Switch
      }, 
      { finalSealPhotos, panoramicPhotos }
    );

    alert('Conferência Finalizada com Sucesso!');
    router.push('/');
  } catch (error) {
    console.error(error);
    alert(`Erro ao finalizar: ${(error as Error).message}`);
  }
};

onMounted(async () => {
  const id = Number(route.params.id);
  if (id) {
    await store.fetchInspectionById(id);
    // Se o backend já retornar o status, podemos preencher o switch (opcional)
    // if (currentInspection.value?.hasPrecinto) hasPrecinto.value = true;
  }
});
</script>