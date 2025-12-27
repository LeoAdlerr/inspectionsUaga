<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title class="pa-4 bg-primary">
        <span class="text-h5">Finalizar Inspeção (Fotos e Lacre)</span>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form ref="form">
          <v-text-field v-model="sealNumber" label="Número do Lacre Pós-Inspeção" :rules="requiredRule"
            variant="outlined" density="compact" class="mb-4" required></v-text-field>

          <v-file-input prepend-icon="mdi-camera" v-model="platePhotoFile" label="Foto da Placa (Obrigatória)" :rules="fileRule" accept="image/*" capture="environment"
            variant="outlined" density="compact" class="mb-2" show-size required></v-file-input>

          <v-img v-if="platePreview" :src="platePreview" height="150" class="mb-4"
            style="border: 1px solid #ccc; border-radius: 4px;"></v-img>

          <v-file-input prepend-icon="mdi-camera" v-model="sealPhotoFile" label="Foto do Lacre (Obrigatória)" :rules="fileRule" accept="image/*" capture="environment"
            variant="outlined" density="compact" class="mb-2" show-size required></v-file-input>

          <v-img v-if="sealPreview" :src="sealPreview" height="150" class="mb-4"
            style="border: 1px solid #ccc; border-radius: 4px;"></v-img>

        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn text @click="handleCancel">Cancelar</v-btn>
        <v-btn color="primary" variant="elevated" @click="handleSave" :disabled="isSaveDisabled">
          Concluir e Finalizar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';

// --- Props & Emits ---
const props = defineProps({
  modelValue: Boolean, // v-model
});

const emit = defineEmits(['close', 'save']);

// --- Estado do Modal ---
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => !value && emit('close'),
});

// --- Estado do Formulário (CORRIGIDO) ---
const form = ref<any>(null); // Ref para o <v-form>
const sealNumber = ref('');
// Os refs devem ser File | null, não File[]
const platePhotoFile = ref<File | null>(null);
const sealPhotoFile = ref<File | null>(null);

// --- Lógica de Validação (CORRIGIDO) ---
const requiredRule = [(v: string) => !!v || 'Campo obrigatório'];
// A regra de arquivo também deve esperar File | null
const fileRule = [(v: File | null) => v !== null || 'Arquivo obrigatório'];

const isSaveDisabled = computed(() => {
  // A lógica agora verifica 'null' em vez de '.length'
  return !sealNumber.value || !platePhotoFile.value || !sealPhotoFile.value;
});

// --- Lógica de Preview (CORRIGIDO) ---
const platePreview = computed(() => {
  // Agora acessa o ref diretamente
  return platePhotoFile.value ? URL.createObjectURL(platePhotoFile.value) : null;
});
const sealPreview = computed(() => {
  // Agora acessa o ref diretamente
  return sealPhotoFile.value ? URL.createObjectURL(sealPhotoFile.value) : null;
});

// --- Limpeza / Reset (CORRIGIDO) ---
const resetForm = () => {
  sealNumber.value = '';
  platePhotoFile.value = null; // Resetar para null
  sealPhotoFile.value = null; // Resetar para null
  form.value?.resetValidation();
};

// Limpa o formulário quando o modal é fechado
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    // Atraso para que o usuário não veja o formulário limpando
    setTimeout(resetForm, 300);
  }
});

// --- Ações ---
const handleCancel = () => {
  emit('close');
};

// --- handleSave (CORRIGIDO) ---
const handleSave = () => {
  
  // O valor do ref É o arquivo.
  const plateFile = platePhotoFile.value;
  const sealFile = sealPhotoFile.value;

  // 2. Verificação final
  if (!plateFile || !sealFile) {
    console.error('ERRO: plateFile ou sealFile está undefined. Abortando.');
    alert("Erro: Arquivos não encontrados. Tente selecionar novamente.");
    return;
  }

  // 3. Emite os OBJETOS FILE corretos
  console.log('SUCESSO: Emitindo payload para o index.vue');
  emit('save', {
    dto: { sealUagaPostInspection: sealNumber.value },
    files: {
      platePhoto: plateFile,
      sealPhoto: sealFile
    }
  });
  emit('close');
};
</script>

<style scoped>
/* Estilos opcionais, se necessário */
</style>