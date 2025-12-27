<template>
  <v-container>
    <div v-if="isPortariaOnly" class="d-flex justify-center align-center h-screen">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <div class="ml-4 text-h6 text-grey">Redirecionando para o Controle de Saída...</div>
    </div>

    <v-responsive v-else class="text-center">
      <h1 class="my-8 text-h4 font-weight-bold">Bem-vindo, {{ authStore.user?.username || 'Usuário' }}</h1>

      <v-btn v-if="isDocumental || isAdmin" color="yellow-darken-2" size="x-large"
        prepend-icon="mdi-plus-circle-outline" class="mb-10" :block="mobile" @click="startNewInspection"
        data-testid="start-new-checklist-btn">
        Iniciar Novo Checklist 8/18
      </v-btn>

      <div class="mb-4">
        <v-tabs v-if="isInspector" v-model="activeTab" align-tabs="center" color="primary" show-arrows>
          <v-tab value="inspection"><v-icon start>mdi-clipboard-check</v-icon>A Inspecionar</v-tab>
          <v-tab value="sealing"><v-icon start>mdi-lock</v-icon>A Lacrar</v-tab>
          <v-tab value="history"><v-icon start>mdi-history</v-icon>Histórico</v-tab>
        </v-tabs>

        <v-tabs v-else-if="isDocumental" v-model="activeTab" align-tabs="center" color="indigo" show-arrows>
          <v-tab value="issues" color="error">
            <v-icon start>mdi-alert-circle</v-icon>
            Pendências
            <v-badge v-if="reprovedCount > 0" :content="reprovedCount" color="error" inline></v-badge>
          </v-tab>
          <v-tab value="rfb" color="indigo">
            <v-icon start>mdi-seal</v-icon>
            Lacração RFB
            <v-badge v-if="rfbCount > 0" :content="rfbCount" color="indigo" inline></v-badge>
          </v-tab>
          <v-tab value="all" color="primary"><v-icon start>mdi-format-list-bulleted</v-icon>Todas</v-tab>
        </v-tabs>
        
        <v-tabs v-else-if="isConferente" v-model="activeTab" align-tabs="center" color="secondary" show-arrows>
           <v-tab value="conference"><v-icon start>mdi-dolly</v-icon>Minha Fila de Conferência</v-tab>
           <v-tab value="history"><v-icon start>mdi-history</v-icon>Histórico / Finalizadas</v-tab>
        </v-tabs>

        <v-divider v-if="isInspector || isDocumental || isConferente"></v-divider>
      </div>

      <h2 class="mb-3 text-h5 font-weight-bold mt-4">
        {{ getListTitle }}
      </h2>

      <v-row justify="center" class="mb-4" v-if="!isInspector && !isConferente && !(isDocumental && (activeTab === 'issues' || activeTab === 'rfb'))">
        <v-col cols="12" md="6" lg="4">
          <v-select v-model="selectedStatus" :items="statusFilterOptions" label="Filtrar por Status" density="compact"
            variant="outlined" clearable @click:clear="selectedStatus = 'Todos'"
            data-testid="status-filter-select"></v-select>
        </v-col>
      </v-row>

      <v-card v-if="!mobile" flat rounded="lg">
        <v-data-table :headers="tableHeaders" :items="filteredInspections" :loading="isLoading"
          loading-text="Buscando inspeções..." no-data-text="Nenhuma inspeção encontrada nesta fila">
          <template #item.createdAt="{ value }">
            {{ formatDate(value) }}
            <v-tooltip location="top" v-if="isUrgent(value)">
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props" color="error" size="small" class="ml-1">mdi-fire</v-icon>
              </template>
              <span>Urgente (> 4h)</span>
            </v-tooltip>
          </template>
          <template #item.entryRegistration="{ value }">{{ value || 'N/A' }}</template>
          <template #item.vehiclePlates="{ value }">{{ value || 'N/A' }}</template>

          <template #item.status.name="{ value }">
            <v-chip size="small" :color="getStatusColor(value)">
              {{ getDisplayStatus(value) }}
            </v-chip>
          </template>

          <template #item.inspector="{ value }">
            <v-chip :color="value ? 'default' : 'warning'">
              {{ value?.fullName || 'AGUARDANDO' }}
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <div v-if="isInspector">
               <template v-if="activeTab === 'inspection'">
                  <v-btn v-if="item.status.name === 'AGUARDANDO_INSPECAO'" small variant="tonal" color="success" @click="handleAssign(item)">Assumir</v-btn>
                  <v-btn v-else-if="item.inspector?.id === currentUser?.id" small variant="tonal" class="mr-2" @click="editInspection(item.id)">Inspecionar</v-btn>
               </template>
               <template v-if="activeTab === 'sealing'">
                  <v-btn small variant="elevated" color="secondary" @click="goToSealingPage(item.id)"><v-icon start>mdi-lock-plus</v-icon>Lacrar</v-btn>
               </template>
               <template v-if="activeTab === 'history'">
                  <v-btn small variant="tonal" color="primary" @click="goToReportPage(item.id)"><v-icon start>mdi-file-pdf-box</v-icon>Ver Relatório</v-btn>
               </template>
            </div>

            <div v-else-if="isConferente">
              <template v-if="activeTab === 'conference'">
                  <v-btn v-if="item.status.name === 'AGUARDANDO_CONFERENCIA'" small variant="elevated" color="success" @click="handleAssignConferente(item)">
                    <v-icon start>mdi-hand-right</v-icon> Assumir Carga
                  </v-btn>
                  <v-btn v-else-if="item.status.name === 'EM_CONFERENCIA'" small variant="tonal" color="secondary" @click="goToConferencePage(item.id)">
                    <v-icon start>mdi-dolly</v-icon> Continuar Conferência
                  </v-btn>
              </template>
              <template v-if="activeTab === 'history'">
                  <v-btn small variant="tonal" color="primary" @click="goToReportPage(item.id)">
                    <v-icon start>mdi-file-pdf-box</v-icon> Ver Relatório
                  </v-btn>
              </template>
            </div>

            <div v-else>
              <v-btn 
                v-if="isDocumental && item.status.id === 6" 
                color="indigo" 
                size="small" 
                variant="tonal"
                class="mr-2"
                @click="openRfbModal(item)"
              >
                <v-icon start>mdi-seal</v-icon> Lacração RFB
              </v-btn>

              <v-btn small variant="tonal" color="info" class="mr-2" @click="goToReviewPage(item.id)">
                {{ item.status.name === 'REPROVADO' ? 'Analisar' : 'Revisar' }}
              </v-btn>
              <v-btn v-if="['EM_INSPECAO', 'AGUARDANDO_INSPECAO'].includes(item.status.name)" small
                variant="tonal" color="error" @click="confirmDelete(item)">
                Apagar
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <div v-else>
         <v-progress-circular v-if="isLoading" indeterminate color="primary"></v-progress-circular>
         <div v-if="!isLoading && filteredInspections.length === 0">Nenhuma inspeção encontrada nesta fila</div>

         <v-card v-for="item in filteredInspections" :key="item.id" class="mb-4 text-left border">
            <v-card-title class="d-flex justify-space-between">
               <span>Checklist #{{ item.id }}</span>
               <v-icon v-if="isUrgent(item.createdAt)" color="error" size="small">mdi-fire</v-icon>
            </v-card-title>
            <v-card-subtitle>{{ formatDate(item.createdAt) }}</v-card-subtitle>
            <v-card-text>
               <div><strong>RE:</strong> {{ item.entryRegistration || 'N/A' }}</div>
               <div><strong>Placa:</strong> {{ item.vehiclePlates || 'N/A' }}</div>
               <div v-if="item.containerNumber"><strong>Container:</strong> {{ item.containerNumber }}</div>
               <div class="mt-2">
                 <v-chip size="small" :color="getStatusColor(item.status.name)">{{ getDisplayStatus(item.status.name) }}</v-chip>
               </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
               <v-spacer></v-spacer>
               <div v-if="isConferente" class="w-100">
                  <template v-if="activeTab === 'conference'">
                      <v-btn block v-if="item.status.name === 'AGUARDANDO_CONFERENCIA'" variant="elevated" color="success" size="large" @click="handleAssignConferente(item)">Assumir Carga</v-btn>
                      <v-btn block v-else-if="item.status.name === 'EM_CONFERENCIA'" variant="tonal" color="secondary" size="large" @click="goToConferencePage(item.id)">Continuar Conferência</v-btn>
                  </template>
                  <template v-if="activeTab === 'history'">
                      <v-btn block variant="tonal" color="primary" size="large" @click="goToReportPage(item.id)">Ver Relatório</v-btn>
                  </template>
               </div>
               <div v-else-if="isInspector">
                  </div>
               <div v-else>
                  </div>
            </v-card-actions>
         </v-card>
      </div>
    </v-responsive>

    <RfbSealingModal 
      v-model="showRfbModal" 
      :inspection="selectedRfbInspection" 
      @success="handleRfbSuccess"
    />

  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useInspectionsStore } from '@/stores/inspections';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { useDisplay } from 'vuetify';
import type { Inspection } from '@/models';
import RfbSealingModal from '@/components/RfbSealingModal.vue';

const { mobile } = useDisplay();
const router = useRouter();

const inspectionsStore = useInspectionsStore();
const { inspections, isLoading } = storeToRefs(inspectionsStore);

const authStore = useAuthStore();
const { user: currentUser, userRoles, isAdmin } = storeToRefs(authStore);

// --- COMPUTEDS BÁSICOS ---
const isInspector = computed(() => userRoles.value.includes('INSPECTOR'));
const isDocumental = computed(() => userRoles.value.includes('DOCUMENTAL'));
const isConferente = computed(() => userRoles.value.includes('CONFERENTE'));
const isPortaria = computed(() => userRoles.value.includes('PORTARIA'));

// [LÓGICA CRUCIAL] Verifica se é APENAS portaria (para redirecionar)
const isPortariaOnly = computed(() => {
  return isPortaria.value && !isAdmin.value && !isInspector.value && !isDocumental.value && !isConferente.value;
});

// --- ESTADO ---
const selectedStatus = ref<string>('Todos');
const activeTab = ref<string>('inspection'); 
const showRfbModal = ref(false);
const selectedRfbInspection = ref<Inspection | null>(null);

// --- CICLO DE VIDA (REDIRECIONAMENTO) ---
onMounted(() => {
  // Se for usuário exclusivamente de Portaria, manda para a tela específica imediatamente
  if (isPortariaOnly.value) {
    router.replace('/gate'); // Use replace para não sujar o histórico
    return;
  }

  // Lógica normal para outros perfis
  if (isDocumental.value) {
     activeTab.value = 'issues'; 
  }
  else if (isConferente.value) activeTab.value = 'conference'; 
  else if (isInspector.value) activeTab.value = 'inspection';
  
  // Carrega lista para quem fica na Dashboard
  inspectionsStore.fetchInspections();
});

// ... (Resto do código: filteredInspections, tableHeaders, etc. mantidos IGUAIS, mas removendo a lógica da Portaria daqui, pois ela foi para /gate) ...

const statusFilterOptions = [
  'Todos', 'AGUARDANDO_INSPECAO', 'EM_INSPECAO', 'APROVADO', 'REPROVADO',
  'AGUARDANDO_CONFERENCIA', 'EM_CONFERENCIA', 'CONFERENCIA_FINALIZADA',
  'APROVADO_COM_RESSALVAS', 'AGUARDANDO_LACRACAO', 'LIBERADO_SAIDA',
  'AGUARDANDO_SAIDA', 'FINALIZADO', 'REPROVADO_POS_AVALIACAO'
];

const reprovedCount = computed(() => {
  return inspections.value.filter(i => i.status.name === 'REPROVADO').length;
});

const rfbCount = computed(() => {
  return inspections.value.filter(i => i.status.id === 6).length;
});

const getListTitle = computed(() => {
  if (isInspector.value) {
    if (activeTab.value === 'inspection') return 'Fila de Checklist';
    if (activeTab.value === 'sealing') return 'Fila de Lacração';
    if (activeTab.value === 'history') return 'Histórico de Inspeções';
  }
  if (isConferente.value) {
     if (activeTab.value === 'conference') return 'Fila de Carregamento';
     if (activeTab.value === 'history') return 'Histórico de Conferências';
  }
  if (isDocumental.value) {
    if (activeTab.value === 'issues') return 'Gestão de Exceções (Reprovadas)';
    if (activeTab.value === 'rfb') return 'Aguardando Lacração RFB';
    return 'Todas as Inspeções';
  }
  return 'Inspeções Salvas';
});

const getDisplayStatus = (statusName: string) => {
  if (isInspector.value && statusName === 'REPROVADO') return 'ANÁLISE DOCUMENTAL';
  if (statusName === 'CONFERENCIA_FINALIZADA') return 'AGUARDANDO RFB';
  return statusName;
};

const getStatusColor = (statusName: string) => {
  if (statusName === 'APROVADO') return 'success';
  if (statusName === 'REPROVADO') return 'error';
  if (statusName === 'AGUARDANDO_INSPECAO') return 'warning';
  if (statusName === 'AGUARDANDO_CONFERENCIA') return 'purple'; 
  if (statusName === 'EM_CONFERENCIA') return 'purple-darken-2';
  if (statusName === 'CONFERENCIA_FINALIZADA') return 'indigo';
  if (statusName === 'APROVADO_COM_RESSALVAS') return 'teal';
  return 'default';
};

const isUrgent = (dateString: string) => {
  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours > 4;
};

const filteredInspections = computed(() => {
  let list = inspections.value;

  if (isInspector.value) {
     if (activeTab.value === 'inspection') {
       list = list.filter(item => item.status.name === 'AGUARDANDO_INSPECAO' || ((item.status.name === 'EM_INSPECAO' || item.status.name === 'REPROVADO') && item.inspector?.id === currentUser.value?.id));
     } else if (activeTab.value === 'sealing') {
       const sealingStatuses = ['APROVADO', 'APROVADO_COM_RESSALVAS', 'REPROVADO'];
       list = list.filter(item => sealingStatuses.includes(item.status.name) && item.inspector?.id === currentUser.value?.id);
     } else if (activeTab.value === 'history') {
       const historyStatuses = ['AGUARDANDO_CONFERENCIA', 'EM_CONFERENCIA', 'CONFERENCIA_FINALIZADA'];
       list = list.filter(item => item.inspector?.id === currentUser.value?.id && historyStatuses.includes(item.status.name));
     }
  } 
  else if (isConferente.value) {
    if (activeTab.value === 'conference') {
       list = list.filter(item => 
          item.status.name === 'AGUARDANDO_CONFERENCIA' || 
          (item.status.name === 'EM_CONFERENCIA' && item.conferente?.id === currentUser.value?.id)
       );
    } else if (activeTab.value === 'history') {
       list = list.filter(item => 
          item.status.name != 'EM_CONFERENCIA' && 
          item.conferente?.id === currentUser.value?.id
       );
    }
  }
  else if (isDocumental.value) {
    if (activeTab.value === 'issues') return list.filter(item => item.status.name === 'REPROVADO');
    if (activeTab.value === 'rfb') return list.filter(item => item.status.id === 6); 
  }

  if (!selectedStatus.value || selectedStatus.value === 'Todos') return list;
  return list.filter(item => item.status.name === selectedStatus.value);
});

const tableHeaders = [
  { title: 'ID', key: 'id', align: 'start' },
  { title: 'RE', key: 'entryRegistration', align: 'start' },
  { title: 'Placa', key: 'vehiclePlates', align: 'start' },
  { title: 'Data de Início', key: 'createdAt', align: 'start' },
  { title: 'Status', key: 'status.name', align: 'start' },
  { title: 'Inspetor', key: 'inspector', align: 'start' },
  { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
] as const;

const formatDate = (dateString: string) => { return dateString ? new Date(dateString).toLocaleString() : ''; };

// Navegação
const startNewInspection = () => router.push('/inspections/new');
const editInspection = (id: number) => router.push(`/inspections/${id}`);
const goToReviewPage = (id: number) => {
    const inspection = inspections.value.find(i => i.id === id);
    if (inspection && inspection.status.name === 'REPROVADO') router.push(`/inspections/${id}/review`);
    else router.push(`/inspections/${id}/finalize`);
};
const goToSealingPage = (id: number) => router.push(`/inspections/${id}/sealing`);
const goToReportPage = (id: number) => router.push(`/inspections/${id}/report`);
const goToConferencePage = (id: number) => router.push(`/inspections/${id}/conference`);

const handleAssign = async (item: Inspection) => {
  if (confirm(`Assumir inspeção #${item.id}?`)) await inspectionsStore.assignInspection(item.id);
};

const handleAssignConferente = async (item: Inspection) => {
  if (confirm(`Iniciar conferência da carga #${item.id}?`)) {
    try {
        await inspectionsStore.fetchInspectionById(item.id); 
        await inspectionsStore.startLoading();
        router.push(`/inspections/${item.id}/conference`);
    } catch (error) {
        alert(`Erro ao iniciar conferência: ${(error as Error).message}`);
    }
  }
};

const confirmDelete = async (item: Inspection) => {
  if (confirm(`Apagar inspeção #${item.id}?`)) await inspectionsStore.deleteInspection(item.id);
};

const openRfbModal = (item: Inspection) => {
  selectedRfbInspection.value = item;
  showRfbModal.value = true;
};

const handleRfbSuccess = () => {
  inspectionsStore.fetchInspections(); 
};
</script>