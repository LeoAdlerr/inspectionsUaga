<template>
  <v-layout>
    <v-snackbar v-model="showMeasuresAlert" :timeout="5000" color="error" location="top">
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-alert-circle</v-icon>
        <span>É obrigatório salvar as medidas do container antes de finalizar a inspeção!</span>
      </div>
      <template v-slot:actions>
        <v-btn variant="text" @click="measuresPanel = 0">
          Preencher Agora
        </v-btn>
      </template>
    </v-snackbar>

    <v-app-bar color="primary" density="compact">
      <v-app-bar-nav-icon data-testid="nav-drawer-btn" @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>Inspeção de Cargas</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" :permanent="!mobile" :temporary="mobile" width="300">
      <v-list-item title="Pontos de Inspeção" :subtitle="`Checklist #${currentInspection?.id}`"></v-list-item>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item v-for="item in sortedItems" :key="item.id"
          :title="`${item.masterPoint.pointNumber}. ${item.masterPoint.name}`" :value="item.masterPointId"
          :active="selectedPoint?.id === item.id" @click="handlePointSelection(item)">
          <template v-slot:prepend>
            <v-icon :color="getStatusColor(item.statusId)" :icon="getStatusIcon(item.statusId)" size="small"></v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-overlay :model-value="isSaving || isLoading || isSubmitting" class="align-center justify-center" persistent>
        <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
        <div class="mt-4 text-center">Aguarde...</div>
      </v-overlay>

      <v-container v-if="!isLoading && selectedPoint">

        <v-expansion-panels v-model="measuresPanel" class="mb-6 border" flat>
          <v-expansion-panel :class="{ 'required-measures-alert': !areMeasuresValid && isChecklistComplete }">
            <v-expansion-panel-title expand-icon="mdi-chevron-down">
              <div class="d-flex align-center">
                <v-icon start icon="mdi-ruler-square" :color="areMeasuresValid ? 'primary' : 'error'"></v-icon>
                <span class="text-subtitle-1 font-weight-bold"
                  :class="areMeasuresValid ? 'text-primary' : 'text-error'">
                  Aferição de Medidas
                  <span v-if="!areMeasuresValid && isChecklistComplete" class="ml-2 text-caption">
                    (OBRIGATÓRIO PARA FINALIZAR)
                  </span>
                </span>

                <v-chip size="small" class="ml-4" v-if="currentInspection?.containerType">
                  {{ currentInspection.containerType.name }}
                </v-chip>

                <v-badge v-if="!areMeasuresValid && isChecklistComplete" color="error" content="!" inline
                  class="ml-2"></v-badge>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <v-alert :type="areMeasuresValid ? 'info' : 'warning'" variant="tonal" density="compact"
                class="mb-4 text-caption">
                <template v-if="!areMeasuresValid && isChecklistComplete">
                  <v-icon color="error" size="small" class="mr-1">mdi-alert</v-icon>
                  <strong>ATENÇÃO:</strong> As medidas do container são obrigatórias para finalizar a inspeção.
                </template>
                <template v-else>
                  Confira as medidas reais da unidade. O sistema alertará divergências superiores a 10%.
                </template>
              </v-alert>

              <v-form @submit.prevent="saveMeasures">
                <v-row>
                  <v-col cols="12" sm="4">
                    <v-text-field v-model="measuresForm.verifiedLength" label="Comprimento (m) *" placeholder="0,00"
                      variant="outlined" density="compact" inputmode="decimal" :hint="getStandardHint('length')"
                      persistent-hint :error-messages="getDeviationWarning('length', measuresForm.verifiedLength)"
                      :error="!areMeasuresValid && isChecklistComplete && !measuresForm.verifiedLength"
                      :disabled="isFormDisabled && !isInspectionReproved" required></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="4">
                    <v-text-field v-model="measuresForm.verifiedWidth" label="Largura (m) *" placeholder="0,00"
                      variant="outlined" density="compact" inputmode="decimal" :hint="getStandardHint('width')"
                      persistent-hint :error-messages="getDeviationWarning('width', measuresForm.verifiedWidth)"
                      :error="!areMeasuresValid && isChecklistComplete && !measuresForm.verifiedWidth"
                      :disabled="isFormDisabled && !isInspectionReproved" required></v-text-field>
                  </v-col>

                  <v-col cols="12" sm="4">
                    <v-text-field v-model="measuresForm.verifiedHeight" label="Altura (m) *" placeholder="0,00"
                      variant="outlined" density="compact" inputmode="decimal" :hint="getStandardHint('height')"
                      persistent-hint :error-messages="getDeviationWarning('height', measuresForm.verifiedHeight)"
                      :error="!areMeasuresValid && isChecklistComplete && !measuresForm.verifiedHeight"
                      :disabled="isFormDisabled && !isInspectionReproved" required></v-text-field>
                  </v-col>
                </v-row>

                <div class="d-flex justify-end mt-4">
                  <v-btn color="primary" variant="elevated" type="submit" :loading="isSavingMeasures"
                    :disabled="isFormDisabled && !isInspectionReproved">
                    <v-icon start>mdi-content-save-check</v-icon>
                    Salvar Medidas
                  </v-btn>
                </div>
              </v-form>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-card data-testid="checklist-point-card"
          :title="`${selectedPoint.masterPoint.pointNumber}. ${selectedPoint.masterPoint.name}`"
          :subtitle="selectedPoint.masterPoint.description">
          <v-card-text>
            <div class="mb-2 text-subtitle-1 font-weight-bold">Status</div>

            <div class="d-flex flex-column flex-md-row align-md-center gap-3 mb-4">

              <v-btn-toggle :model-value="activeStatus" color="primary" group @update:model-value="requestStatusChange"
                class="flex-grow-1" :disabled="isInspectionReproved">
                <v-btn data-testid="status-btn-ok" :value="2" @click="confirmStatusChange">Conforme</v-btn>
                <v-btn data-testid="status-btn-not-ok" :value="3" @click="confirmStatusChange">Não Conforme</v-btn>
                <v-btn data-testid="status-btn-na" :value="4" @click="confirmStatusChange">N/A</v-btn>
              </v-btn-toggle>

              <v-btn size="large" :color="getNextButtonColor()" :prepend-icon="getNextButtonIcon()"
                @click.prevent="handleSaveAndNext" :disabled="isSaveNextButtonDisabled || isInspectionReproved"
                class="flex-md-grow-0" :block="mobile" data-testid="save-and-next-btn">

                <template v-if="isChecklistComplete && !areMeasuresValid">
                  <v-icon left color="error">mdi-alert</v-icon>
                  Medidas Pendentes
                </template>
                <template v-else-if="isChecklistComplete">
                  <v-icon left>mdi-draw</v-icon>
                  Coletar Assinatura
                </template>
                <template v-else>
                  <v-icon left>mdi-arrow-right</v-icon>
                  Salvar e Próximo
                </template>

                <v-tooltip v-if="isChecklistComplete && !areMeasuresValid" activator="parent" location="top">
                  Preencha as medidas do container para continuar
                </v-tooltip>
              </v-btn>
            </div>

            <div class="mt-6 mb-2 text-subtitle-1 font-weight-bold">Observações</div>
            <v-textarea v-model="selectedPoint.observations" variant="outlined" rows="3" auto-grow
              :disabled="isFormDisabled" placeholder="Selecione um status para habilitar."></v-textarea>

            <div class="d-flex align-center justify-space-between mt-4 mb-2">
              <div class="text-subtitle-1 font-weight-bold">Evidências</div>
              <v-btn v-if="selectedPoint.evidences && selectedPoint.evidences.length > 0" color="blue" variant="tonal"
                size="small" @click="isEvidenceManagerOpen = true">
                Gerir Evidências ({{ selectedPoint.evidences.length }})
              </v-btn>
            </div>

            <v-file-input v-model="stagedFile" label="Anexar nova imagem (opcional)" variant="outlined"
              prepend-icon="mdi-camera" accept="image/*" placeholder="Selecione um status para habilitar."
              :clearable="true" data-testid="file-input" :disabled="isFormDisabled"></v-file-input>
          </v-card-text>

          <v-card-actions class="pa-4">
            <div class="d-flex flex-column flex-sm-row w-100 gap-2">
              <v-btn size="large" color="success" prepend-icon="mdi-content-save" @click.prevent="saveCurrentPoint"
                block class="flex-sm-grow-1" :disabled="isFormDisabled">
                Salvar Alterações
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>

    <v-dialog v-model="isEvidenceManagerOpen" max-width="800">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon left>mdi-image-multiple</v-icon> Evidências
          <v-chip v-if="isInspectionReproved" color="error" size="small" class="ml-2">
            Análise Documental
          </v-chip>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col v-for="ev in selectedPoint?.evidences" :key="ev.id" cols="12" sm="6" md="4"
              class="d-flex flex-column align-center">
              <div class="image-container" @click="viewEvidence(ev)">
                <v-img :src="`/${ev.filePath}`" max-height="150" contain class="image-thumbnail mb-2">
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                    </v-row>
                  </template>
                  <div class="image-overlay">
                    <v-icon color="white" size="32">mdi-magnify-plus-outline</v-icon>
                    <div class="text-caption white--text mt-1">Clique para ampliar</div>
                  </div>
                </v-img>
              </div>
              <div class="text-caption text-truncate font-weight-medium" style="max-width: 100%;">
                {{ ev.fileName || 'Evidência' }}
              </div>
              <div class="d-flex gap-2 mt-2">
                <v-btn color="primary" size="small" :loading="isDownloading" @click.stop="downloadEvidence(ev)"
                  data-testid="download-btn">
                  <v-icon left>mdi-download</v-icon> Baixar
                </v-btn>

                <v-tooltip v-if="isInspectionReproved" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" color="error" size="small" @click.stop="" :disabled="true"
                      data-testid="delete-btn">
                      <v-icon left>mdi-delete</v-icon> Excluir
                    </v-btn>
                  </template>
                  <span>Exclusão bloqueada - Inspeção em análise documental</span>
                </v-tooltip>

                <v-btn v-else color="error" size="small" @click.stop="confirmDelete(ev)" data-testid="delete-btn"
                  :disabled="isFormDisabled">
                  <v-icon left>mdi-delete</v-icon> Excluir
                </v-btn>
              </div>
            </v-col>
          </v-row>

          <v-alert v-if="isInspectionReproved" type="info" variant="tonal" density="compact" class="mt-4">
            <template v-slot:prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            Inspeção em análise documental. Você pode adicionar novas evidências, mas não pode excluir as existentes.
          </v-alert>

          <div v-if="!selectedPoint?.evidences || selectedPoint.evidences.length === 0"
            class="text-center text-subtitle-1 mt-4">
            Nenhuma evidência anexada.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="isEvidenceManagerOpen = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isImageViewerOpen" max-width="600" @click:outside="isImageViewerOpen = false">
      <v-card>
        <v-img :src="viewingEvidenceUrl" aspect-ratio="1.5" contain max-height="70vh">
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
            </v-row>
          </template>
        </v-img>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="isImageViewerOpen = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isDeleteConfirmOpen" max-width="400">
      <v-card>
        <v-card-title>Confirmar Exclusão</v-card-title>
        <v-card-text>Tem certeza que deseja excluir esta evidência?</v-card-text>
        <v-card-actions>
          <v-btn text color="primary" @click="isDeleteConfirmOpen = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn text color="error" @click="executeDelete">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <SignatureModal v-model="showDriverModal" title="Assinatura do Motorista"
      label="Eu, Motorista, concordo com a inspeção." @save="handleDriverSave" @close="showDriverModal = false" />

  </v-layout>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';
import type { FinalizeInspectionDto, InspectionChecklistItem, ItemEvidence, UpdateInspectionDto } from '@/models';
import { useDisplay } from 'vuetify';
// Modals
import SignatureModal from '@/components/SignatureModal.vue';

// --- IDs de Status ---
const STATUS_EM_INSPECAO = 1;
const STATUS_APROVADO = 2;
const STATUS_REPROVADO = 3;

const { mobile } = useDisplay();
const drawer = ref(!mobile.value);
const route = useRoute();
const router = useRouter();
const inspectionsStore = useInspectionsStore();
const { currentInspection, isLoading, isSubmitting } = storeToRefs(inspectionsStore);

const selectedPoint = ref<InspectionChecklistItem | null>(null);
const isSaving = ref(false);
const isDownloading = ref(false);
const isStatusConfirmOpen = ref(false);
const pendingStatusChange = ref<number | null>(null);
const modalTitle = ref('');
const modalText = ref('');
const stagedFile = ref<File | null>(null);
const showDriverModal = ref(false);
const showMeasuresAlert = ref(false);

// Variável para controlar o painel de medidas
const measuresPanel = ref<number | undefined>(undefined);

// --- MEDIDAS ---
const isSavingMeasures = ref(false);
const measuresForm = reactive({
  verifiedLength: undefined as number | undefined,
  verifiedWidth: undefined as number | undefined,
  verifiedHeight: undefined as number | undefined,
});

// [HELPER] Sanitização
const sanitizeMeasure = (val: string | number | undefined): number | undefined => {
  if (val === null || val === undefined || val === '') return undefined;
  const strVal = String(val).replace(',', '.');
  const numVal = parseFloat(strVal);
  if (isNaN(numVal)) return undefined;
  return Number(numVal.toFixed(2));
};

// Referência
const CONTAINER_STANDARDS: Record<string, { l: number, w: number, h: number }> = {
  'DRY_20': { l: 5.90, w: 2.35, h: 2.39 },
  'DRY_40': { l: 12.03, w: 2.35, h: 2.39 },
  'HC_40': { l: 12.03, w: 2.35, h: 2.69 },
};

const getStandardValues = () => {
  const typeName = currentInspection.value?.containerType?.name;
  if (typeName && CONTAINER_STANDARDS[typeName]) return CONTAINER_STANDARDS[typeName];
  if (typeName?.includes('20')) return CONTAINER_STANDARDS['DRY_20'];
  if (typeName?.includes('40')) return CONTAINER_STANDARDS['DRY_40'];
  return null;
};

const getStandardHint = (dimension: 'length' | 'width' | 'height') => {
  const std = getStandardValues();
  if (!std) return undefined;
  const val = dimension === 'length' ? std.l : dimension === 'width' ? std.w : std.h;
  return `Padrão aprox: ${val}m`;
};

const getDeviationWarning = (dimension: 'length' | 'width' | 'height', value?: number) => {
  if (!value) return [];
  const std = getStandardValues();
  if (!std) return [];
  const cleanVal = sanitizeMeasure(value);
  if (!cleanVal) return [];
  const stdVal = dimension === 'length' ? std.l : dimension === 'width' ? std.w : std.h;
  const diff = Math.abs(cleanVal - stdVal);
  const percentage = diff / stdVal;
  if (percentage > 0.1) {
    return [`Atenção: Desvio de ${(percentage * 100).toFixed(1)}% do padrão (${stdVal}m)`];
  }
  return [];
};

const saveMeasures = async () => {
  if (!currentInspection.value) return;
  isSavingMeasures.value = true;
  try {
    const payload: UpdateInspectionDto = {
      verifiedLength: sanitizeMeasure(measuresForm.verifiedLength),
      verifiedWidth: sanitizeMeasure(measuresForm.verifiedWidth),
      verifiedHeight: sanitizeMeasure(measuresForm.verifiedHeight)
    };
    await inspectionsStore.updateInspection(currentInspection.value.id, payload);
    (document.activeElement as HTMLElement)?.blur();
    measuresPanel.value = undefined;
  } catch (error) {
    console.error(error);
  } finally {
    isSavingMeasures.value = false;
  }
};

// Modais Evidência
const isEvidenceManagerOpen = ref(false);
const isImageViewerOpen = ref(false);
const viewingEvidence = ref<ItemEvidence | null>(null);
const viewingEvidenceUrl = ref('');
const isDeleteConfirmOpen = ref(false);
const evidenceToDelete = ref<ItemEvidence | null>(null);

// --- COMPUTEDS ---
const isInspectionFinalized = computed(() => {
  if (!currentInspection.value) return false;
  const readOnlyStatuses = [STATUS_APROVADO];
  return readOnlyStatuses.includes(currentInspection.value.status.id);
});

const isFormDisabled = computed(() => isInspectionFinalized.value);

const areMeasuresValid = computed(() => {
  const i = currentInspection.value;
  if (!i) return false;
  return (i.verifiedLength != null && i.verifiedLength > 0) &&
    (i.verifiedWidth != null && i.verifiedWidth > 0) &&
    (i.verifiedHeight != null && i.verifiedHeight > 0);
});

const isChecklistComplete = computed(() => {
  if (!currentInspection.value) return false;
  return currentInspection.value.items.every((item) => item.statusId !== STATUS_EM_INSPECAO);
});

const isSaveNextButtonDisabled = computed(() => {
  if (isInspectionFinalized.value) return false;
  if (isChecklistComplete.value) {
    return !areMeasuresValid.value;
  }
  return false;
});

const isInspectionReproved = computed(() => {
  return currentInspection.value?.status.id === STATUS_REPROVADO;
});

// --- FUNÇÕES HELPER PARA O BOTÃO DE PRÓXIMO ---
const getNextButtonColor = () => {
  if (isChecklistComplete.value && !areMeasuresValid.value) return 'error';
  if (isInspectionFinalized.value) return 'primary';
  return isChecklistComplete.value ? 'primary' : 'default';
};

const getNextButtonIcon = () => {
  if (isChecklistComplete.value && !areMeasuresValid.value) return 'mdi-alert';
  if (isInspectionFinalized.value) return 'mdi-arrow-right';
  return isChecklistComplete.value ? 'mdi-draw' : 'mdi-arrow-right';
};

const activeStatus = computed(() => {
  if (selectedPoint.value?.statusId === STATUS_EM_INSPECAO) return null;
  return selectedPoint.value?.statusId;
});

const sortedItems = computed(() => {
  if (!currentInspection.value?.items) return [];
  return [...currentInspection.value.items].sort(
    (a, b) => a.masterPoint.pointNumber - b.masterPoint.pointNumber
  );
});

// Helpers UI
const getStatusColor = (statusId: number) => {
  const colors: Record<number, string> = { 1: 'grey', 2: 'success', 3: 'error', 4: 'warning' };
  return colors[statusId] || 'grey';
};
const getStatusIcon = (statusId: number) => {
  const icons: Record<number, string> = { 1: 'mdi-progress-clock', 2: 'mdi-check-circle', 3: 'mdi-close-circle', 4: 'mdi-minus-circle' };
  return icons[statusId] || 'mdi-help-circle';
};

// --- AÇÕES ---

const handleSaveAndNext = async () => {
  if (!selectedPoint.value || !currentInspection.value) return;

  // CASO 1: Inspeção já finalizada
  if (isInspectionFinalized.value) {
    if (currentInspection.value.status.id === STATUS_REPROVADO) {
      alert('Esta inspeção foi REPROVADA e está sob Análise Documental.');
      router.push('/');
    } else {
      router.push(`/inspections/${currentInspection.value.id}/sealing`);
    }
    return;
  }

  // Gatekeeper Medidas - Com feedback visual
  if (isChecklistComplete.value && !areMeasuresValid.value) {
    showMeasuresAlert.value = true;
    measuresPanel.value = 0;

    // Scroll suave para o painel de medidas
    setTimeout(() => {
      const measuresEl = document.querySelector('.v-expansion-panel');
      measuresEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Destacar visualmente o painel
      measuresEl?.classList.add('shake-animation');
      setTimeout(() => {
        measuresEl?.classList.remove('shake-animation');
      }, 1000);
    }, 100);

    return;
  }
  
  isSaving.value = true;
  try {
    await saveCurrentPoint();

    const updatedTarget = inspectionsStore.getNextNavigationTarget(selectedPoint.value.masterPoint.pointNumber);

    if (updatedTarget.type === 'POINT' && updatedTarget.point) {
      handlePointSelection(updatedTarget.point);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (updatedTarget.type === 'FINALIZE') {
      showDriverModal.value = true;
    }
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    isSaving.value = false;
  }
};

/**
 * Finaliza: Assina Motorista -> Finaliza Checklist -> Verifica Status -> Navega
 */
const handleDriverSave = async (signatureBase64: string) => {
  if (!currentInspection.value) return;
  isSaving.value = true;
  try {
    await inspectionsStore.attachDriverSignature(currentInspection.value.id, signatureBase64);

    const dummyDto: FinalizeInspectionDto = { sealUagaPostInspection: '' };

    const result = await inspectionsStore.finalizeInspectionWithPhotos(
      currentInspection.value.id,
      dummyDto,
      {} as any
    );

    if (result.statusId === STATUS_REPROVADO) {
      alert('Inspeção Finalizada: REPROVADA.\nEncaminhada para Análise Documental.');
      router.push('/');
    } else {
      router.push(`/inspections/${currentInspection.value.id}/sealing`);
    }

  } catch (error) {
    alert(`Erro ao finalizar: ${(error as Error).message}`);
  } finally {
    isSaving.value = false;
  }
};

// --- Gestão de Pontos ---
function requestStatusChange(newStatusId: number | undefined | null) {
  if (!selectedPoint.value || newStatusId == null || newStatusId === selectedPoint.value.statusId) return;
  if (isFormDisabled.value) {
    alert('Esta inspeção já foi finalizada.');
    return;
  }
  modalTitle.value = 'Confirmar Mudança de Status';
  modalText.value = 'Tem certeza que deseja alterar o status deste ponto?';
  pendingStatusChange.value = newStatusId;
  isStatusConfirmOpen.value = true;
}

function confirmStatusChange() {
  if (!selectedPoint.value || pendingStatusChange.value === null) return;
  selectedPoint.value.statusId = pendingStatusChange.value;
  isStatusConfirmOpen.value = false;
  pendingStatusChange.value = null;
  saveCurrentPoint();
}

function viewEvidence(evidence: ItemEvidence) {
  viewingEvidence.value = evidence;
  viewingEvidenceUrl.value = `/${evidence.filePath}`;
  isImageViewerOpen.value = true;
}

const downloadEvidence = async (evidence: ItemEvidence) => {
  if (!selectedPoint.value) return;
  isDownloading.value = true;
  try {
    await inspectionsStore.downloadEvidence(selectedPoint.value, evidence);
  } catch (error) {
    alert('Erro ao baixar evidência');
  } finally {
    isDownloading.value = false;
  }
};

function confirmDelete(evidence: ItemEvidence) {
  evidenceToDelete.value = evidence;
  isDeleteConfirmOpen.value = true;
}

async function executeDelete() {
  if (evidenceToDelete.value && selectedPoint.value) {
    await inspectionsStore.deleteEvidence(selectedPoint.value, evidenceToDelete.value);
    if (selectedPoint.value.evidences.length === 0) {
      isEvidenceManagerOpen.value = false;
    }
  }
  isDeleteConfirmOpen.value = false;
  evidenceToDelete.value = null;
}

const saveCurrentPoint = async (e?: Event) => {
  e?.preventDefault();
  if (!selectedPoint.value) return;

  if (isFormDisabled.value) {
    alert('Esta inspeção já foi finalizada.');
    return;
  }

  const fileToUpload = stagedFile.value;
  const isPointPending = selectedPoint.value.statusId === STATUS_EM_INSPECAO;

  if (isPointPending) {
    if (!fileToUpload && !selectedPoint.value.observations) {
      alert('Por favor, selecione um Status ou adicione uma observação/evidência para salvar.');
      throw new Error('Validação falhou');
    }
  }

  isSaving.value = true;
  try {
    await inspectionsStore.updateChecklistItem(selectedPoint.value.masterPointId, {
      statusId: selectedPoint.value.statusId,
      observations: selectedPoint.value.observations || '',
    });

    if (fileToUpload) {
      await inspectionsStore.uploadEvidence(selectedPoint.value.masterPointId, fileToUpload);
      stagedFile.value = null;
    }
  } catch (error) {
    if ((error as Error).message !== 'Validação falhou') {
      alert(`Erro ao salvar: ${(error as Error).message}`);
    }
    throw error;
  } finally {
    isSaving.value = false;
  }
};

const handlePointSelection = (item: InspectionChecklistItem) => {
  if (selectedPoint.value?.id === item.id) return;
  selectedPoint.value = item;
  stagedFile.value = null;
  if (mobile.value) drawer.value = false;
};

// Watchers
watch(currentInspection, (newVal) => {
  if (newVal) {
    if (selectedPoint.value) {
      const updatedPoint = newVal.items.find((item) => item.id === selectedPoint.value?.id);
      if (updatedPoint) selectedPoint.value = updatedPoint;
    }
    if (newVal.verifiedLength) measuresForm.verifiedLength = newVal.verifiedLength;
    if (newVal.verifiedWidth) measuresForm.verifiedWidth = newVal.verifiedWidth;
    if (newVal.verifiedHeight) measuresForm.verifiedHeight = newVal.verifiedHeight;
  }
}, { deep: true });

// Watcher para abrir automaticamente o painel de medidas quando o checklist estiver completo
watch([isChecklistComplete, areMeasuresValid], ([isComplete, isValid]) => {
  if (isComplete && !isValid) {
    // Abre automaticamente o painel de medidas quando o checklist é completado
    // mas as medidas não foram preenchidas
    setTimeout(() => {
      measuresPanel.value = 0;
    }, 300);
  }
}, { immediate: true });

onMounted(() => {
  const inspectionId = Number((route.params as { id: string }).id);
  inspectionsStore.fetchInspectionById(inspectionId).then(() => {
    if (currentInspection.value && currentInspection.value.items.length > 0) {
      if (isInspectionFinalized.value) {
        selectedPoint.value = sortedItems.value[0];
      } else {
        const firstPending = currentInspection.value.items.find(item => item.statusId === STATUS_EM_INSPECAO);
        selectedPoint.value = firstPending || sortedItems.value[0];
      }
    }
  });

  if (window.Cypress) {
    (window.Cypress as any).vue = {
      handleSaveAndNext,
      saveCurrentPoint,
      requestStatusChange,
      confirmStatusChange,
      setStagedFile: (file: File) => { stagedFile.value = file; },
      getState: () => ({ selectedPoint: selectedPoint.value }),
    };
  }
});
</script>

<style scoped>
/* Estilos para alerta visual nas medidas obrigatórias */
.required-measures-alert {
  border-left: 4px solid #ff5252 !important;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {

  0%,
  100% {
    border-left-color: #ff5252;
  }

  50% {
    border-left-color: #ff8a80;
  }
}

.shake-animation {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

/* Melhorar a visibilidade dos campos obrigatórios */
.v-text-field--error .v-label {
  color: #ff5252 !important;
}

/* Badge de obrigatório */
.v-badge--inline {
  vertical-align: text-top;
}

/* Estilo para o painel quando medidas estão pendentes */
.v-expansion-panel-title--active {
  background-color: rgba(255, 82, 82, 0.05);
}

/* Estilos para as evidências */
.image-container {
  position: relative;
  cursor: pointer;
  width: 100%;
}

.image-thumbnail {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-thumbnail:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.image-container:hover .image-overlay {
  opacity: 1;
}
</style>