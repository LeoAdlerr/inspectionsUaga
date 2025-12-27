import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { VForm } from 'vuetify/components';
import { createTestingPinia } from '@pinia/testing';
import { useInspectionsStore } from '@/stores/inspections';
import FinalizePage from './finalize.vue';
import type { Inspection } from '@/models';

// Mocks
const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
};
vi.mock('vue-router/auto', () => ({
  useRoute: vi.fn(() => ({ params: { id: '123' } })),
  useRouter: vi.fn(() => mockRouter),
}));
const vuetify = createVuetify();
window.alert = vi.fn();

const getMockInspection = (): Inspection => ({
  id: 123,
  inspectorId: 1,
  inspector: { id: 1, fullName: 'Inspetor Teste' } as any,
  driverName: 'Motorista Teste',
  startDatetime: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  status: { id: 1, name: 'EM_INSPECAO' } as any, // as any para simplificar o mock
  modality: { id: 1, name: 'Rodoviário' } as any,
  operationType: { id: 1, name: 'Importação' } as any,
  unitType: { id: 1, name: 'Contêiner' } as any,
  containerType: { id: 2, name: 'DRY_40' } as any,
  items: [],
  vehiclePlates: 'ABC-1234',
  transportDocument: 'CTE-5678',
  entryRegistration: 'RE-123',
  containerNumber: 'CNTR1234567', 
});

describe('Tela 4: Revisar e Finalizar Inspeção', () => {

  const mountComponent = (initialState = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        inspections: {
          currentInspection: getMockInspection(),
          ...initialState,
        },
      },
    });
    const store = useInspectionsStore(pinia);
    
    store.updateInspection = vi.fn().mockResolvedValue({});

    const wrapper = mount(FinalizePage, {
      global: { plugins: [vuetify, pinia] },
    });
    return { wrapper, store };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar os dados e exibir o formulário em modo somente leitura', async () => {
    const { wrapper } = mountComponent();
    await wrapper.vm.$nextTick();

    const inspectorInput = wrapper.find('[data-testid="inspector-name-input"]');
    expect(inspectorInput.find('input').attributes('readonly')).toBeDefined();
  });

  describe('Fluxo de Edição', () => {
    it('deve habilitar os campos do formulário ao clicar em "Liberar Edição"', async () => {
      const { wrapper } = mountComponent();
      await wrapper.vm.$nextTick();
      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      const inspectorInput = wrapper.find('[data-testid="inspector-name-input"]');
      expect(inspectorInput.find('input').attributes('readonly')).toBeUndefined();
    });

    it('deve chamar a action "updateInspection" ao salvar as alterações', async () => {
      const { wrapper, store } = mountComponent();
      await wrapper.vm.$nextTick();

      // Encontramos o componente VForm e mockamos seu método 'validate'.
      const formComponent = wrapper.findComponent(VForm);
      vi.spyOn(formComponent.vm, 'validate').mockResolvedValue({ valid: true, errors: [] });

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      const inspectorInput = wrapper.find('[data-testid="inspector-name-input"]');
      await inspectorInput.find('input').setValue('Novo Nome do Inspetor');

      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      expect(store.updateInspection).toHaveBeenCalledTimes(1);
    });

    it('deve bloquear os campos novamente após salvar', async () => {
      const { wrapper } = mountComponent();
      await wrapper.vm.$nextTick();

      // mockamos a validação aqui para permitir que a função 'saveChanges' complete.
      const formComponent = wrapper.findComponent(VForm);
      vi.spyOn(formComponent.vm, 'validate').mockResolvedValue({ valid: true, errors: [] });

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      // --- ADICIONE ESTA LINHA ---
      await flushPromises();
      await wrapper.vm.$nextTick();

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(false);
    });
  });
});