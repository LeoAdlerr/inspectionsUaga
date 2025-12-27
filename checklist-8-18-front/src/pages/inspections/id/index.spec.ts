import { describe, it, expect, beforeEach, vi} from 'vitest';
import { flushPromises, mount, shallowMount, VueWrapper } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createTestingPinia } from '@pinia/testing';
import { useInspectionsStore } from '@/stores/inspections';
import ChecklistPage from './index.vue';
import type { Inspection, User } from '@/models';

// Usamos o mock híbrido para o vue-router.
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual, // Mantemos todas as funções reais (como createRouter)
    useRoute: () => ({ params: { id: '123' } }), // Sobrescrevemos o useRoute
    useRouter: () => ({ // Sobrescrevemos o useRouter
      push: vi.fn(),
    }),
  };
});

const vuetify = createVuetify();

// Helper
const createMockInspection = (isComplete = false): Inspection => ({
  id: 123,
  inspectorId: 10,
  inspector: { id: 10, fullName: 'Inspetor Teste' } as User,
  items: Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    masterPointId: i + 1,
    statusId: isComplete ? 2 : 1,
    evidences: [],
    masterPoint: { pointNumber: i + 1, name: `Ponto ${i + 1}` },
  })),
} as any);

describe('Tela 3: Checklist (inspections/[id].vue)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Usamos shallowMount para testes que não precisam interagir com o DOM interno
  it('deve buscar a inspeção ao montar', async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const store = useInspectionsStore(pinia);
    store.fetchInspectionById = vi.fn();

    shallowMount(ChecklistPage, { global: { plugins: [vuetify, pinia] } });

    expect(store.fetchInspectionById).toHaveBeenCalledWith(123);
  });

  // Para testes que precisam interagir com o DOM, usamos mount
  describe('Interações com o DOM', () => {
    let wrapper: VueWrapper<any>;
    let store: ReturnType<typeof useInspectionsStore>;

    beforeEach(async () => {
      const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
      store = useInspectionsStore(pinia);
      store.currentInspection = createMockInspection();

      // Mockamos as actions para controlar o comportamento
      store.updateChecklistItem = vi.fn().mockResolvedValue({});
      store.uploadEvidence = vi.fn().mockResolvedValue({ id: 2, fileName: 'test.jpg', filePath: 'uploads/test.jpg' });

      wrapper = mount(ChecklistPage, {
        global: { plugins: [vuetify, pinia] },
      });
      await flushPromises();
    });

    it('chama updateChecklistItem ao confirmar a mudança de status', async () => {
      wrapper.vm.requestStatusChange(3);
      await wrapper.vm.$nextTick(); // Espera o dialog ser processado
      await wrapper.vm.confirmStatusChange();

      expect(store.updateChecklistItem).toHaveBeenCalled();
    });

    it('chama uploadEvidence quando um arquivo é salvo', async () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      // Acessamos o 'ref' diretamente para simular a seleção do arquivo
      wrapper.vm.stagedFile = [mockFile];

      await wrapper.vm.saveCurrentPoint();

      // A action espera um único File, não um array.
      expect(store.uploadEvidence).toHaveBeenCalledWith(expect.any(Number), mockFile);
    });

    it('botão Finalizar deve ser DESABILITADO se o checklist estiver incompleto', () => {
      const finalizeButton = wrapper.findAll('button').find(b => b.text().includes('Revisar e Finalizar'));
      expect(finalizeButton!.attributes('disabled')).toBeDefined();
    });

    it('botão Finalizar deve ser HABILITADO se o checklist estiver completo', async () => {
      store.currentInspection = createMockInspection(true); // Mock com inspeção completa
      await wrapper.vm.$nextTick(); // Espera a re-renderização

      const finalizeButton = wrapper.findAll('button').find(b => b.text().includes('Revisar e Finalizar'));
      expect(finalizeButton!.attributes('disabled')).toBeUndefined();
    });
  });
});