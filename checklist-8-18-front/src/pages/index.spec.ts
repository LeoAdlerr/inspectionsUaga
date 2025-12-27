import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createVuetify, useDisplay } from 'vuetify';
import { createTestingPinia } from '@pinia/testing';
import { useInspectionsStore } from '@/stores/inspections';
import { useAuthStore } from '@/stores/auth';
import IndexPage from './index.vue';
import type { Inspection, User } from '@/models';

// Mock do vue-router
const mockRouter = {
  push: vi.fn(),
};
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual, useRouter: () => mockRouter };
});
vi.mock('vuetify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vuetify')>();
  return { ...actual, useDisplay: vi.fn(() => ({ mobile: false })) };
});

const vuetify = createVuetify();

// Helper para criar inspeções mockadas consistentes
const createMockInspection = (id: number, statusName: 'EM_INSPECAO' | 'APROVADO' | 'REPROVADO'): Inspection => ({
  id,
  createdAt: new Date().toISOString(),
  inspectorId: 1,
  inspector: { id: 1, fullName: 'Leonardo Teste' } as User,
  driverName: 'Motorista Teste',
  status: { id: 1, name: statusName },
} as any);

describe('Tela Inicial (index.vue)', () => {
  let wrapper: VueWrapper<any>;
  let inspectionsStore: ReturnType<typeof useInspectionsStore>;

  // A função de montagem aceita um array de inspeções para popular o estado inicial
  const mountComponent = (initialInspections: Inspection[] = []) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        inspections: { inspections: initialInspections },
        auth: { user: { username: 'inspetor.teste' } },
      },
    });
    wrapper = mount(IndexPage, {
      global: {
        plugins: [vuetify, pinia],
      },
    });
    inspectionsStore = useInspectionsStore();
    useAuthStore();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useDisplay as Mock).mockReturnValue({ mobile: false });
    // Mockamos o window.confirm para controlar a resposta nos testes de deleção
    window.confirm = vi.fn(() => true);
  });

  it('deve renderizar a saudação e chamar fetchInspections ao ser montado', () => {
    mountComponent();
    expect(wrapper.text()).toContain('Bem-vindo, inspetor.teste');
    expect(inspectionsStore.fetchInspections).toHaveBeenCalledTimes(1);
  });

  it('deve chamar router.push para a página de nova inspeção ao clicar no botão "Iniciar"', async () => {
    mountComponent();
    await wrapper.find('[data-testid="start-new-checklist-btn"]').trigger('click');
    expect(mockRouter.push).toHaveBeenCalledWith('/inspections/new');
  });

  describe('Ações da Lista de Inspeções', () => {
    it('deve chamar router.push para a página do checklist ao clicar em "Continuar"', async () => {
      const mockInspection = createMockInspection(123, 'EM_INSPECAO');
      mountComponent([mockInspection]);
      await wrapper.vm.$nextTick();

      await wrapper.find('[data-testid="continue-btn-123"]').trigger('click');
      expect(mockRouter.push).toHaveBeenCalledWith('/inspections/123');
    });

    it('deve chamar router.push para a página de revisão ao clicar em "Revisar"', async () => {
      const mockInspection = createMockInspection(456, 'APROVADO');
      mountComponent([mockInspection]);
      await wrapper.vm.$nextTick();

      // Encontra o botão "Revisar" na linha da tabela
      const reviewButton = wrapper.find('tbody tr').findAll('button').find(b => b.text().includes('Revisar'));
      await reviewButton!.trigger('click');
      expect(mockRouter.push).toHaveBeenCalledWith('/inspections/456/finalize');
    });

    it('deve chamar a action deleteInspection quando o usuário confirma a exclusão', async () => {
      const mockInspection = createMockInspection(789, 'EM_INSPECAO');
      mountComponent([mockInspection]);
      await wrapper.vm.$nextTick();

      const deleteButton = wrapper.findAll('button').find(b => b.text().includes('Apagar'));
      await deleteButton!.trigger('click');

      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(inspectionsStore.deleteInspection).toHaveBeenCalledWith(789);
    });

    it('NÃO deve chamar a action deleteInspection quando o usuário cancela a exclusão', async () => {
      (window.confirm as Mock).mockReturnValue(false); // Simula o clique em "Cancelar"

      const mockInspection = createMockInspection(789, 'EM_INSPECAO');
      mountComponent([mockInspection]);
      await wrapper.vm.$nextTick();

      const deleteButton = wrapper.findAll('button').find(b => b.text().includes('Apagar'));
      await deleteButton!.trigger('click');

      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(inspectionsStore.deleteInspection).not.toHaveBeenCalled();
    });
  });
});