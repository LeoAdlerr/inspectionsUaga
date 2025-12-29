<template>
  <v-container fluid class="fill-height bg-grey-lighten-4 pa-0 d-flex flex-column">
    
    <v-app-bar color="blue-grey-darken-4" elevation="4">
      <v-app-bar-title class="font-weight-bold d-flex align-center">
        <v-icon start icon="mdi-boom-gate-up" class="mr-2" :size="mobile ? 'small' : 'default'"></v-icon>
        <span :class="mobile ? 'text-subtitle-1' : 'text-h6'">
          {{ mobile ? 'PORTARIA' : 'PORTARIA & CONTROLE' }}
        </span>
      </v-app-bar-title>
      
      <template v-slot:append>
        <div class="d-flex align-center">
          <v-btn v-if="mobile" icon="mdi-plus" color="yellow-accent-4" variant="elevated" class="mr-2 text-blue-grey-darken-4" size="small" to="/inspections/new"></v-btn>
          <v-btn v-else prepend-icon="mdi-plus-circle-outline" color="yellow-accent-4" variant="elevated" class="mr-4 text-blue-grey-darken-4 font-weight-bold" height="40" to="/inspections/new">Novo Checklist</v-btn>
          <v-divider vertical color="grey" class="mx-2 my-3 hidden-xs"></v-divider>
          <div class="text-right mr-3 d-none d-sm-block">
            <div class="text-caption text-grey-lighten-1">Atualizado</div>
            <div class="font-weight-bold text-white">{{ lastUpdated || '--:--' }}</div>
          </div>
          <v-btn icon="mdi-refresh" :size="mobile ? 'small' : 'large'" color="light-blue-accent-3" variant="tonal" @click="forceRefresh" :loading="isLoading" />
        </div>
      </template>

      <template v-slot:extension>
        <v-tabs v-model="activeTab" align-tabs="start" color="light-blue-accent-3" bg-color="blue-grey-darken-3" class="px-0 w-100" :grow="mobile" density="comfortable">
          <v-tab value="control" class="text-caption font-weight-bold"><v-icon start class="d-none d-sm-flex">mdi-gate</v-icon> LIBERAÇÃO</v-tab>
          <v-tab value="list" class="text-caption font-weight-bold"><v-icon start class="d-none d-sm-flex">mdi-format-list-bulleted</v-icon> VISÃO GERAL</v-tab>
        </v-tabs>
      </template>
    </v-app-bar>

    <v-main class="w-100 bg-grey-lighten-3 flex-grow-1">
      <v-window v-model="activeTab" class="h-100">
        
        <v-window-item value="control" class="h-100 overflow-y-auto">
          <v-container fluid :class="mobile ? 'pa-2' : 'pa-4'">
            <div v-if="isLoading && gateQueue.length === 0" class="d-flex justify-center align-center py-10">
              <v-progress-circular indeterminate size="64" color="blue-grey"></v-progress-circular>
            </div>
            <div v-else-if="gateQueue.length === 0" class="d-flex flex-column justify-center align-center py-16 text-center">
              <v-icon size="80" color="grey-lighten-1">mdi-truck-check-outline</v-icon>
              <h2 class="text-h6 text-grey mt-4">Nenhum veículo na fila</h2>
            </div>
            <v-row v-else dense>
              <v-col v-for="item in gateQueue" :key="item.id" cols="12" sm="6" lg="4" xl="3">
                <v-card elevation="4" border class="rounded-lg h-100 d-flex flex-column">
                  <v-sheet color="blue-grey-lighten-5" class="px-3 py-2 d-flex justify-space-between align-center border-b">
                    <div class="d-flex align-center text-truncate" style="max-width: 70%;">
                      <v-icon size="small" start color="blue-grey">mdi-account-hard-hat</v-icon>
                      <span class="text-caption font-weight-bold text-truncate text-uppercase">{{ item.driverName }}</span>
                    </div>
                    <v-chip color="success" variant="flat" size="x-small" class="font-weight-bold px-2">{{ formatTime(item.releasedAt) }}</v-chip>
                  </v-sheet>
                  <v-card-text class="flex-grow-1 text-center py-4 px-2">
                    <div class="text-caption text-uppercase font-weight-bold text-medium-emphasis mb-1">Placa</div>
                    <div class="font-weight-black text-blue-grey-darken-4 mb-3 bg-grey-lighten-4 rounded py-1 border border-dashed text-uppercase" :class="mobile ? 'text-h4' : 'text-h2'">{{ item.vehiclePlates }}</div>
                    <div class="text-caption text-uppercase font-weight-bold text-medium-emphasis">Container</div>
                    <div class="font-weight-bold text-blue-grey-darken-3 mb-3" :class="mobile ? 'text-h5' : 'text-h4'">{{ item.containerNumber }}</div>
                    <v-divider class="mb-3"></v-divider>
                    <div class="d-flex justify-space-around align-center">
                      <div class="d-flex flex-column align-center">
                        <span class="text-caption font-weight-bold text-indigo mb-0">RFB</span>
                        <v-chip v-if="isValidSeal(item.rfbSeal)" color="indigo" variant="elevated" :size="mobile ? 'default' : 'large'" class="font-weight-bold">{{ item.rfbSeal }}</v-chip>
                        <span v-else class="text-caption text-grey">N/A</span>
                      </div>
                      <div class="d-flex flex-column align-center">
                        <span class="text-caption font-weight-bold text-orange-darken-3 mb-0">ARMADOR</span>
                        <v-chip v-if="isValidSeal(item.armadorSeal)" color="orange-darken-3" variant="tonal" :size="mobile ? 'default' : 'large'" class="font-weight-bold">{{ item.armadorSeal }}</v-chip>
                        <span v-else class="text-caption text-grey">N/A</span>
                      </div>
                    </div>
                  </v-card-text>

                  <v-divider></v-divider>
                  <v-card-actions class="pa-0" style="min-height: 60px;">
                    <v-row no-gutters class="h-100 w-100 ma-0">
                      <v-col cols="6">
                        <v-btn variant="flat" color="deep-orange-lighten-5" class="h-100 w-100 rounded-0 text-deep-orange-darken-4" @click="openRejectModal(item)">
                          <div class="d-flex flex-column align-center py-2">
                            <v-icon :size="mobile ? 24 : 32">mdi-alert-octagon</v-icon>
                            <span class="font-weight-bold" :class="mobile ? 'text-caption' : 'text-button'">BLOQUEAR</span>
                          </div>
                        </v-btn>
                      </v-col>
                      <v-col cols="6">
                        <v-btn variant="flat" color="success" class="h-100 w-100 rounded-0" :loading="isSubmitting && selectedItem?.id === item.id" @click="openValidationModal(item)">
                          <div class="d-flex flex-column align-center py-2">
                            <v-icon :size="mobile ? 24 : 32">mdi-gate-arrow-right</v-icon>
                            <span class="font-weight-bold" :class="mobile ? 'text-caption' : 'text-button'">LIBERAR</span>
                          </div>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-window-item>

        <v-window-item value="list" class="h-100 overflow-y-auto">
           <v-container fluid :class="mobile ? 'pa-2' : 'pa-4'">
            <v-card border elevation="1">
              <v-card-title class="d-flex align-center py-3 bg-grey-lighten-5 flex-wrap gap-2">
                <v-icon start>mdi-database-search</v-icon>
                <span class="text-subtitle-1 font-weight-bold">Visão Geral</span>
                <v-spacer></v-spacer>
                <div :style="{ width: mobile ? '100%' : '300px' }">
                  <v-select v-model="selectedStatus" :items="statusFilterOptions" label="Filtrar Status" density="compact" hide-details variant="outlined" bg-color="white"></v-select>
                </div>
              </v-card-title>
              <v-divider></v-divider>
              <v-data-table :headers="listHeaders" :items="filteredAllInspections" :loading="isLoading" density="compact" hover mobile-breakpoint="sm">
                <template v-slot:item.createdAt="{ value }"><span class="text-caption">{{ formatDate(value) }}</span></template>
                <template v-slot:item.status.name="{ value }"><v-chip size="x-small" :color="getStatusColor(value)" class="font-weight-bold">{{ getDisplayStatus(value) }}</v-chip></template>
                <template v-slot:item.actions="{ item }"><v-btn size="small" variant="tonal" color="primary" :to="`/inspections/${item.id}/report`" icon="mdi-file-document-outline" density="compact"></v-btn></template>
              </v-data-table>
            </v-card>
          </v-container>
        </v-window-item>
      </v-window>
    </v-main>

    <v-dialog v-model="showModal" max-width="600px" persistent :fullscreen="mobile" transition="dialog-bottom-transition">
      <v-card v-if="selectedItem" class="d-flex flex-column">
        <v-toolbar color="success" density="comfortable">
          <v-btn icon="mdi-close" color="white" @click="closeModal"></v-btn>
          <v-toolbar-title class="text-h6 font-weight-bold text-white">Conferência de Saída</v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pa-4 flex-grow-1 overflow-y-auto bg-grey-lighten-5">
          <div class="text-center mb-6 mt-2">
            <div class="text-overline mb-1">Veículo</div>
            <div class="text-h4 font-weight-black text-blue-grey-darken-3 text-uppercase">{{ selectedItem.vehiclePlates }}</div>
          </div>
          <v-alert icon="mdi-eye-check" type="info" variant="tonal" class="mb-6 border rounded-lg text-body-2">Confirme se os dados físicos batem com o sistema.</v-alert>
          <v-list lines="two" bg-color="transparent" class="pa-0">
            <v-list-item class="bg-white border rounded mb-3 elevation-1 py-2" @click="checks.plate = !checks.plate">
              <template v-slot:prepend><v-icon color="blue-grey" size="large" class="mr-3">mdi-truck</v-icon></template>
              <v-list-item-title class="text-h6 font-weight-bold">{{ selectedItem.vehiclePlates }}</v-list-item-title>
              <v-list-item-subtitle>Placa Confere?</v-list-item-subtitle>
              <template v-slot:append><v-checkbox-btn v-model="checks.plate" color="success" size="large"></v-checkbox-btn></template>
            </v-list-item>
            <v-list-item class="bg-white border rounded mb-3 elevation-1 py-2" @click="checks.container = !checks.container">
              <template v-slot:prepend><v-icon color="blue-grey" size="large" class="mr-3">mdi-package-variant</v-icon></template>
              <v-list-item-title class="text-h6 font-weight-bold">{{ selectedItem.containerNumber }}</v-list-item-title>
              <v-list-item-subtitle>Container Confere?</v-list-item-subtitle>
              <template v-slot:append><v-checkbox-btn v-model="checks.container" color="success" size="large"></v-checkbox-btn></template>
            </v-list-item>
            <v-list-item v-if="hasRfb" class="bg-indigo-lighten-5 border border-indigo rounded mb-3 elevation-1 py-2" @click="checks.rfb = !checks.rfb">
              <template v-slot:prepend><v-icon color="indigo" size="large" class="mr-3">mdi-seal</v-icon></template>
              <v-list-item-title class="text-h6 font-weight-bold text-indigo">{{ selectedItem.rfbSeal }}</v-list-item-title>
              <v-list-item-subtitle class="text-indigo-darken-4 font-weight-bold">LACRE RFB INTACTO?</v-list-item-subtitle>
              <template v-slot:append><v-checkbox-btn v-model="checks.rfb" color="indigo" size="large"></v-checkbox-btn></template>
            </v-list-item>
            <v-list-item v-if="hasArmador" class="bg-white border rounded mb-3 elevation-1 py-2" @click="checks.armador = !checks.armador">
              <template v-slot:prepend><v-icon color="orange-darken-3" size="large" class="mr-3">mdi-seal-variant</v-icon></template>
              <v-list-item-title class="text-h6 font-weight-bold">{{ selectedItem.armadorSeal }}</v-list-item-title>
              <v-list-item-subtitle>Lacre Armador OK?</v-list-item-subtitle>
              <template v-slot:append><v-checkbox-btn v-model="checks.armador" color="success" size="large"></v-checkbox-btn></template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-white">
          <v-btn block color="success" size="x-large" variant="elevated" :loading="isSubmitting" :disabled="!isAllChecked" @click="confirmExit" elevation="4" height="56">
            <v-icon start>mdi-gate-arrow-right</v-icon> AUTORIZAR SAÍDA
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showRejectModal" max-width="600px" persistent :fullscreen="mobile" transition="dialog-bottom-transition">
      <v-card v-if="selectedItem" class="d-flex flex-column border-t-lg border-error">
        
        <v-toolbar color="error" density="comfortable">
          <v-toolbar-title class="text-h6 font-weight-bold text-white">
            <v-icon start color="white">mdi-alert-octagon</v-icon>
            Bloquear / Devolver
          </v-toolbar-title>
          <v-btn icon="mdi-close" color="white" @click="closeRejectModal"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-4 flex-grow-1 overflow-y-auto">
          <div class="text-center mb-6 mt-2">
            <div class="text-overline mb-1">Veículo a Bloquear</div>
            <div class="text-h4 font-weight-black text-red-darken-4 text-uppercase">{{ selectedItem.vehiclePlates }}</div>
          </div>

          <v-form ref="rejectForm" @submit.prevent="confirmReject">
            
            <v-select
              v-model="rejectData.reason"
              label="Motivo da Devolução *"
              :items="rejectReasonOptions"
              item-title="text"
              item-value="value"
              variant="outlined"
              color="error"
              prepend-inner-icon="mdi-help-circle-outline"
              class="mb-4"
            ></v-select>

            <v-textarea
              v-if="rejectData.reason"
              v-model="rejectData.observation"
              label="Observações / Detalhes *"
              variant="outlined"
              color="error"
              rows="3"
              auto-grow
              :hint="rejectData.reason === 'WRONG_DATA' ? 'Descreva qual dado está incorreto.' : 'Descreva a divergência encontrada.'"
              persistent-hint
              class="mb-4"
            ></v-textarea>

            <v-expand-transition>
              <div v-if="rejectData.reason === 'SEAL_DIVERGENCE'" class="mb-4">
                <v-alert type="warning" variant="tonal" class="mb-2 text-caption" density="compact">
                  <v-icon start size="small">mdi-camera</v-icon>
                  Para divergência de lacre, a foto é <strong>obrigatória</strong>.
                </v-alert>
                
                <v-file-input
                  v-model="rejectData.file"
                  label="Foto da Divergência (Lacre) *"
                  variant="outlined"
                  color="error"
                  prepend-icon="mdi-camera"
                  accept="image/*"
                  show-size
                ></v-file-input>
                
                <v-img 
                  v-if="rejectData.file" 
                  :src="previewUrl" 
                  height="150" 
                  class="rounded border bg-grey-lighten-4 mt-2" 
                  contain
                ></v-img>
              </div>
            </v-expand-transition>

          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-btn size="large" variant="text" color="grey-darken-1" @click="closeRejectModal">Cancelar</v-btn>
          <v-spacer></v-spacer>
          <v-btn 
            color="error" 
            size="x-large" 
            variant="elevated" 
            :loading="isSubmitting" 
            :disabled="!isRejectValid" 
            @click="confirmReject" 
            elevation="4"
          >
            <v-icon start>mdi-block-helper</v-icon> CONFIRMAR BLOQUEIO
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, reactive, watch } from 'vue';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';
import { useDisplay } from 'vuetify';
import type { GateQueueItem } from '@/models';
import { GateRejectionReason } from '@/models'; // Certifique-se de exportar isso do model

const { mobile } = useDisplay();
const store = useInspectionsStore();
const { gateQueue, inspections, isLoading, isSubmitting } = storeToRefs(store);

// --- ESTADO LOCAL ---
const activeTab = ref('control'); 
const lastUpdated = ref('');
let pollingInterval: any = null;

// Filtros da Lista
const selectedStatus = ref('Todos');
const statusFilterOptions = [
  'Todos', 'AGUARDANDO_INSPECAO', 'EM_INSPECAO', 'APROVADO', 'REPROVADO',
  'AGUARDANDO_CONFERENCIA', 'EM_CONFERENCIA', 'CONFERENCIA_FINALIZADA',
  'APROVADO_COM_RESSALVAS', 'AGUARDANDO_LACRACAO', 'LIBERADO_SAIDA',
  'AGUARDANDO_SAIDA', 'FINALIZADO', 'REPROVADO_POS_AVALIACAO'
];

// --- MODAL DE SUCESSO (Verde) ---
const showModal = ref(false);
const selectedItem = ref<GateQueueItem | null>(null);
const checks = reactive({ plate: false, container: false, rfb: false, armador: false });

// --- [NOVO] MODAL DE REJEIÇÃO (Vermelho) ---
const showRejectModal = ref(false);
const rejectData = reactive({
  reason: null as GateRejectionReason | null,
  observation: '',
  file: null as File | null | File[] // Vuetify as vezes retorna array
});

const rejectReasonOptions = [
  { text: 'Erro de Digitação (Placa/Container)', value: GateRejectionReason.WRONG_DATA },
  { text: 'Divergência de Lacre (Violado/Errado)', value: GateRejectionReason.SEAL_DIVERGENCE }
];

// --- UTILS ---
const formatTime = (isoString: string) => isoString ? new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-';
const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleString() : '';
const isValidSeal = (val: string | null | undefined) => val && val !== 'N/A' && val.trim() !== '';

// --- HELPER COLORS ---
const getStatusColor = (statusName: string) => {
  if (statusName === 'AGUARDANDO_SAIDA') return 'green-accent-4';
  if (statusName === 'FINALIZADO') return 'grey';
  if (statusName === 'REPROVADO') return 'error';
  if (statusName === 'APROVADO') return 'success';
  return 'primary';
};
const getDisplayStatus = (statusName: string) => statusName === 'AGUARDANDO_SAIDA' ? 'LIBERADO P/ SAÍDA' : statusName;

// --- COMPUTEDS (Listas) ---
const filteredAllInspections = computed(() => {
  if (!selectedStatus.value || selectedStatus.value === 'Todos') return inspections.value;
  return inspections.value.filter(item => item.status.name === selectedStatus.value);
});
const listHeaders = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: 'RE', key: 'entryRegistration' },
  { title: 'Placa', key: 'vehiclePlates' },
  { title: 'Data', key: 'createdAt' },
  { title: 'Status', key: 'status.name' },
  { title: 'Ação', key: 'actions', sortable: false, align: 'end' as const },
];

// --- COMPUTEDS (Modal Verde) ---
const hasRfb = computed(() => selectedItem.value && isValidSeal(selectedItem.value.rfbSeal));
const hasArmador = computed(() => selectedItem.value && isValidSeal(selectedItem.value.armadorSeal));
const isAllChecked = computed(() => {
  if (!selectedItem.value) return false;
  if (!checks.plate || !checks.container) return false;
  if (hasRfb.value && !checks.rfb) return false;
  if (hasArmador.value && !checks.armador) return false;
  return true;
});

// --- [NOVO] COMPUTEDS (Modal Vermelho) ---
const previewUrl = computed(() => {
  const f = rejectData.file;
  if (!f) return '';
  const actualFile = Array.isArray(f) ? f[0] : f;
  return URL.createObjectURL(actualFile);
});

const isRejectValid = computed(() => {
  if (!rejectData.reason) return false;
  
  // Regra 1: Erro de Digitação exige observação
  if (rejectData.reason === GateRejectionReason.WRONG_DATA) {
    return rejectData.observation.length > 5;
  }
  
  // Regra 2: Divergência de Lacre exige Arquivo
  if (rejectData.reason === GateRejectionReason.SEAL_DIVERGENCE) {
    const hasFile = Array.isArray(rejectData.file) ? rejectData.file.length > 0 : !!rejectData.file;
    return hasFile;
  }
  
  return false;
});

// --- ACTIONS ---
const loadData = async () => {
  try {
    await store.fetchGateQueue();
    lastUpdated.value = new Date().toLocaleTimeString('pt-BR');
    if (activeTab.value === 'list') await store.fetchInspections();
  } catch (error) { console.error(error); }
};
const forceRefresh = async () => loadData();
watch(activeTab, (newTab) => { if (newTab === 'list') store.fetchInspections(); });

// -- LÓGICA MODAL VERDE (SUCESSO) --
const openValidationModal = (item: GateQueueItem) => {
  selectedItem.value = item;
  checks.plate = false; checks.container = false; checks.rfb = false; checks.armador = false;
  showModal.value = true;
};
const closeModal = () => { showModal.value = false; selectedItem.value = null; };
const confirmExit = async () => {
  if (!selectedItem.value || !isAllChecked.value) return;
  try {
    await store.registerGateExit(selectedItem.value.id, { rfb: checks.rfb, armador: checks.armador });
    closeModal();
  } catch (err) { alert((err as Error).message); await loadData(); }
};

// -- LÓGICA MODAL VERMELHO (REJEIÇÃO) --
const openRejectModal = (item: GateQueueItem) => {
  selectedItem.value = item;
  // Reset Form
  rejectData.reason = null;
  rejectData.observation = '';
  rejectData.file = null;
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
  // Limpa referência de item MAS NÃO o form imediatamente para evitar glitch visual
  setTimeout(() => { selectedItem.value = null; }, 200);
};

const confirmReject = async () => {
  if (!selectedItem.value || !isRejectValid.value || !rejectData.reason) return;

  const actualFile = Array.isArray(rejectData.file) ? rejectData.file[0] : rejectData.file;

  try {
    await store.rejectGateExit(
      selectedItem.value.id,
      rejectData.reason,
      rejectData.observation,
      actualFile
    );
    closeRejectModal();
    alert('Veículo devolvido com sucesso.');
  } catch (err) {
    alert(`Erro ao rejeitar: ${(err as Error).message}`);
  }
};

onMounted(() => {
  loadData();
  store.fetchInspections();
  pollingInterval = setInterval(loadData, 30000);
});
onUnmounted(() => { if (pollingInterval) clearInterval(pollingInterval); });
</script>

<style scoped>
.text-h2 { letter-spacing: -1px !important; }
</style>