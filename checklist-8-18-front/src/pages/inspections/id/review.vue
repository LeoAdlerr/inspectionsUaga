<template>
  <v-layout>
    <v-app-bar color="error" density="compact">
      <v-btn icon="mdi-arrow-left" @click="router.back()"></v-btn>
      <v-app-bar-title>Análise de Não-Conformidades</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-overlay :model-value="isLoading || isSubmitting" class="align-center justify-center" persistent>
        <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
        <div class="mt-4 text-center text-white font-weight-bold">Processando decisão...</div>
      </v-overlay>

      <v-container v-if="!isLoading && currentInspection" class="pb-16">
        <v-alert
          type="warning"
          variant="tonal"
          border="start"
          class="mb-6"
          icon="mdi-alert-decagram"
        >
          <template v-slot:title>
            Inspeção #{{ currentInspection.id }} Reprovada
          </template>
          Esta inspeção foi bloqueada automaticamente. Analise os itens abaixo e tome uma decisão.
        </v-alert>

        <div class="text-h6 mb-4 font-weight-bold d-flex align-center">
          <v-icon color="error" start>mdi-close-octagon</v-icon>
          Itens Críticos ({{ nonConformities.length }})
        </div>

        <v-row>
          <v-col cols="12" v-for="item in nonConformities" :key="item.id">
            <v-card class="border-error" variant="outlined">
              <v-card-item>
                <v-card-title class="text-error text-subtitle-1 font-weight-bold">
                  {{ item.masterPoint.pointNumber }}. {{ item.masterPoint.name }}
                </v-card-title>
                <v-card-subtitle>
                  {{ item.masterPoint.description }}
                </v-card-subtitle>
              </v-card-item>

              <v-divider></v-divider>

              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="text-caption text-medium-emphasis mb-1">Observação do Inspetor:</div>
                    <div class="text-body-1 bg-grey-lighten-4 pa-3 rounded border">
                      {{ item.observations || 'Sem observações registradas.' }}
                    </div>
                  </v-col>

                  <v-col cols="12" md="6">
                    <div class="text-caption text-medium-emphasis mb-1">Evidência:</div>
                    <div v-if="item.evidences && item.evidences.length > 0">
                      <v-img
                        :src="`/${item.evidences[0].filePath}`"
                        max-height="200"
                        class="bg-grey-lighten-3 rounded border cursor-pointer"
                        cover
                        @click="viewImage(item.evidences[0])"
                      >
                        <template v-slot:placeholder>
                          <div class="d-flex align-center justify-center fill-height">
                            <v-progress-circular indeterminate color="grey"></v-progress-circular>
                          </div>
                        </template>
                      </v-img>
                      <v-btn
                        block
                        color="primary"
                        variant="tonal"
                        size="small"
                        class="mt-2"
                        prepend-icon="mdi-download"
                        @click="downloadEvidence(item.evidences[0])"
                        :loading="isDownloading"
                      >
                        Baixar Evidência
                      </v-btn>
                    </div>
                    <div v-else class="text-body-2 text-grey font-italic py-4 text-center border border-dashed rounded">
                      Sem foto anexada.
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

      </v-container>

      <v-footer app border class="bg-white justify-end pa-4 gap-4">
        <v-btn
          color="error"
          variant="tonal"
          size="large"
          prepend-icon="mdi-cancel"
          @click="openRejectDialog"
        >
          Manter Reprovação
        </v-btn>

        <v-btn
          color="warning"
          variant="elevated"
          size="large"
          prepend-icon="mdi-check-circle-outline"
          @click="openOverrideDialog"
        >
          Aprovar com Ressalvas
        </v-btn>
      </v-footer>

    </v-main>

    <v-dialog v-model="showOverrideDialog" max-width="600" persistent>
        <v-card>
        <v-card-title class="bg-warning text-white pa-4">
          <v-icon start>mdi-alert-circle-check</v-icon> Aprovar com Ressalvas
        </v-card-title>
        <v-card-text class="pt-4">
          <v-alert type="info" density="compact" variant="tonal" class="mb-4">
            Você está prestes a liberar uma inspeção reprovada. Justifique sua decisão.
          </v-alert>
          
          <v-form ref="overrideFormRef">
            <v-textarea
              v-model="overrideForm.justification"
              label="Justificativa do Aceite *"
              placeholder="Por que esta carga pode seguir viagem?"
              variant="outlined"
              :rules="[rules.required, rules.minDesc]"
              rows="3"
            ></v-textarea>

            <v-textarea
              v-model="overrideForm.actionTaken"
              label="Providências Tomadas *"
              placeholder="O que foi feito para mitigar o risco?"
              variant="outlined"
              :rules="[rules.required]"
              rows="3"
              class="mt-2"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn text @click="showOverrideDialog = false">Cancelar</v-btn>
          <v-btn color="warning" variant="elevated" @click="confirmOverride">Confirmar Aprovação</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showRejectDialog" max-width="600" persistent>
        <v-card>
        <v-card-title class="bg-error text-white pa-4">
          <v-icon start>mdi-close-circle</v-icon> Manter Reprovação
        </v-card-title>
        <v-card-text class="pt-4">
          <p class="mb-4">A inspeção permanecerá bloqueada e será arquivada como reprovada.</p>
          <v-form ref="rejectFormRef">
            <v-textarea
              v-model="rejectJustification"
              label="Parecer Final *"
              placeholder="Motivo da manutenção da reprovação..."
              variant="outlined"
              :rules="[rules.required]"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn text @click="showRejectDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="elevated" @click="confirmReject">Confirmar Reprovação</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showImageModal" max-width="800">
      <v-card>
        <v-img :src="previewImageUrl" max-height="80vh" contain class="bg-black"></v-img>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn 
            color="primary" 
            prepend-icon="mdi-download" 
            variant="text" 
            @click="downloadViewingImage"
            :loading="isDownloading"
          >
            Baixar
          </v-btn>
          <v-btn text @click="showImageModal = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-layout>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';
import type { ItemEvidence } from '@/models';
import { OverrideDecision } from '@/models';

const route = useRoute();
const router = useRouter();
const store = useInspectionsStore();
const { currentInspection, isLoading, isSubmitting } = storeToRefs(store);

// Estado
const showImageModal = ref(false);
const previewImageUrl = ref('');
const currentEvidence = ref<ItemEvidence | null>(null); // Para download no modal
const isDownloading = ref(false);

// Modais de Decisão
const showOverrideDialog = ref(false);
const showRejectDialog = ref(false);
const overrideFormRef = ref<any>(null);
const rejectFormRef = ref<any>(null);

const overrideForm = reactive({
  justification: '',
  actionTaken: ''
});
const rejectJustification = ref('');

// Regras
const rules = {
  required: (v: string) => !!v || 'Campo obrigatório.',
  minDesc: (v: string) => (v && v.length >= 5) || 'Mínimo 5 caracteres.'
};

// Computed
const nonConformities = computed(() => {
  if (!currentInspection.value) return [];
  // Filtra itens com status 3 (REPROVADO) e garante que tenham masterPoint
  return currentInspection.value.items.filter(item => item.statusId === 3 && item.masterPoint);
});

// Actions
const viewImage = (evidence: ItemEvidence) => {
  previewImageUrl.value = `/${evidence.filePath}`;
  currentEvidence.value = evidence;
  showImageModal.value = true;
};

// Nova Action: Download de Evidência
const downloadEvidence = async (evidence: ItemEvidence) => {
  if (!currentInspection.value) return;
  
  // Encontrar o item pai da evidência para passar para a store
  const item = currentInspection.value.items.find(i => i.evidences?.some(e => e.id === evidence.id));
  
  if (!item) {
      alert('Erro ao localizar o item da evidência.');
      return;
  }

  isDownloading.value = true;
  try {
    // Usa a action da store que já lida com o download (cria link temporário)
    await store.downloadEvidence(item, evidence);
  } catch (error) {
    console.error('Erro no download:', error);
    alert('Não foi possível baixar a evidência.');
  } finally {
    isDownloading.value = false;
  }
};

const downloadViewingImage = () => {
    if (currentEvidence.value) {
        downloadEvidence(currentEvidence.value);
    }
};

// --- OVERRIDE (Aprovar com Ressalvas - Status 8) ---
const openOverrideDialog = () => {
  showOverrideDialog.value = true;
};

const confirmOverride = async () => {
  const { valid } = await overrideFormRef.value?.validate() ?? { valid: false };
  if (!valid) return;

  if (!confirm('Tem certeza que deseja liberar esta inspeção?')) return;

  try {
    if (currentInspection.value && overrideForm.actionTaken) {
        await store.updateInspection(currentInspection.value.id, {
            actionTaken: overrideForm.actionTaken
        });
    }

    await store.overrideApproval({
      decision: OverrideDecision.APPROVE,
      justification: overrideForm.justification
    });

    alert('Inspeção liberada com sucesso! (Status: Aprovado com Ressalvas)');
    showOverrideDialog.value = false;
    router.push('/');
  } catch (error) {
    alert(`Erro ao aprovar: ${(error as Error).message}`);
  }
};

const openRejectDialog = () => {
  showRejectDialog.value = true;
};

const confirmReject = async () => {
  const { valid } = await rejectFormRef.value?.validate() ?? { valid: false };
  if (!valid) return;
  
  if (!currentInspection.value) return;

  if (!confirm('Esta ação irá ENCERRAR o processo como Reprovado. Confirmar?')) return;

  try {
    await store.overrideApproval({
      decision: OverrideDecision.REJECT,
      justification: rejectJustification.value
    });
    
    alert('Reprovação confirmada. Processo encerrado.');
    showRejectDialog.value = false;
    router.push('/');
  } catch (error) {
    alert(`Erro ao reprovar: ${(error as Error).message}`);
  }
};

onMounted(async () => {
  const id = Number(route.params.id);
  if (id) {
    await store.fetchInspectionById(id);
    if (currentInspection.value && currentInspection.value.statusId !== 3) {
       if (currentInspection.value.statusId !== 8 && currentInspection.value.statusId !== 12) {
         alert('Esta inspeção não está pendente de análise.');
         router.push(`/inspections/${id}/finalize`);
       }
    }
  }
});
</script>