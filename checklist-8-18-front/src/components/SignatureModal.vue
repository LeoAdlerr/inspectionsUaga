<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title class="pa-4 bg-primary">
        <span class="text-h5">{{ props.title }}</span>
      </v-card-title>

      <v-card-text class="pt-4">
        <p class="font-weight-bold mb-2">{{ props.label }}</p>
        <div class="signature-pad">
          <VueSignaturePad
            ref="signaturePad"
            width="100%"
            height="250px"
            :options="{ onEnd }"
          />
        </div>
        <v-btn small variant="text" @click="clearSignature" class="mt-2">
          Limpar
        </v-btn>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn text @click="handleCancel">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="saveSignature"
          :disabled="!isSigned"
        >
          Salvar Assinatura
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { VueSignaturePad } from 'vue-signature-pad';

// 3. Props genéricas para reutilização
const props = defineProps({
  modelValue: Boolean, // v-model
  title: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: 'Por favor, assine abaixo:',
  },
});

// 4. Emit simplificado: 'save' emite a string base64
const emit = defineEmits(['close', 'save']);

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => !value && emit('close'),
});

const signaturePad = ref<InstanceType<typeof VueSignaturePad> | null>(null);
const isSigned = ref(false);

// 5. Lógica de 'onEnd' simplificada
const onEnd = () => {
  isSigned.value = !signaturePad.value?.isEmpty();
};

// 6. Lógica de 'clear' simplificada
const clearSignature = () => {
  signaturePad.value?.clearSignature();
  isSigned.value = false;
};

const handleCancel = () => {
  emit('close');
};

// 7. Lógica de 'save' simplificada
const saveSignature = () => {
  if (isSigned.value && signaturePad.value) {
    const { data } = signaturePad.value.saveSignature();
    // Emite a string base64 pura
    emit('save', data);
    emit('close');
  }
};

// 8. Limpa o pad quando o modal é reaberto
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      // Garante que o pad esteja limpo ao abrir
      // Usamos nextTick para garantir que o 'ref' esteja pronto
      setTimeout(() => {
        clearSignature();
      }, 100);
    }
  }
);
</script>

<style scoped>
.signature-pad {
  border: 1px solid #ccc;
  border-radius: 4px;
  /* Garante que o pad interno ocupe o espaço */
  display: flex;
}
</style>