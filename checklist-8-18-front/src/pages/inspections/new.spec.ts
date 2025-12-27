import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { mount, VueWrapper, flushPromises } from '@vue/test-utils';
import { createVuetify, useDisplay } from 'vuetify';
import { createTestingPinia } from '@pinia/testing';
import { useInspectionsStore } from '@/stores/inspections';
import NewInspectionPage from './new.vue';

// Mock robusto para o vue-router
const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
};
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return { ...actual, useRouter: () => mockRouter };
});

// Mock para o useDisplay
vi.mock('vuetify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vuetify')>();
  return { ...actual, useDisplay: vi.fn(() => ({ mobile: false })) };
});

const vuetify = createVuetify();

describe('Tela 2: Nova Inspeção (new.vue)', () => {
  let wrapper: VueWrapper<any>;
  let inspectionsStore: ReturnType<typeof useInspectionsStore>;
  //let authStore: ReturnType<typeof useAuthStore>;

  const mountComponent = () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        auth: { user: { id: 1, username: 'inspetor.logado', roles: ['INSPECTOR'] } },
        inspections: { inspectors: [{ id: 1, fullName: 'Inspetor Logado' }], modalities: [], operationTypes: [], unitTypes: [] }
      },
    });

    // Usamos o mount simples, agora que o componente não tem dependências de layout
    wrapper = mount(NewInspectionPage, {
      global: {
        plugins: [vuetify, pinia],
      },
    });
    
    inspectionsStore = useInspectionsStore();
    //authStore = useAuthStore();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useDisplay as Mock).mockReturnValue({ mobile: false });
  });

  it('deve chamar a action fetchFormLookups ao ser montado', () => {
    mountComponent();
    expect(inspectionsStore.fetchFormLookups).toHaveBeenCalledTimes(1);
  });

  it('deve pré-selecionar o inspetor logado se ele tiver o perfil "INSPECTOR"', async () => {
    mountComponent();
    await flushPromises(); // Espera a promise do onMounted resolver
    expect((wrapper.vm as any).form.inspectorId).toBe(1);
  });
  
  it('deve chamar a action createInspection quando o formulário for válido', async () => {
    mountComponent();
    
    const formRefMock = { validate: vi.fn().mockResolvedValue({ valid: true }) };
    (wrapper.vm as any).formRef = formRefMock;

    const mockCreatedInspection = { id: 999 };
    vi.mocked(inspectionsStore.createInspection).mockResolvedValue(mockCreatedInspection as any);

    await wrapper.find('form').trigger('submit.prevent');
    
    expect(inspectionsStore.createInspection).toHaveBeenCalled();
    await flushPromises();
    expect(mockRouter.push).toHaveBeenCalledWith('/inspections/999');
  });

  it('NÃO deve chamar a action createInspection se o formulário for inválido', async () => {
    mountComponent();
    const formRefMock = { validate: vi.fn().mockResolvedValue({ valid: false }) };
    (wrapper.vm as any).formRef = formRefMock;
    
    await wrapper.find('form').trigger('submit.prevent');

    expect(inspectionsStore.createInspection).not.toHaveBeenCalled();
  });
});