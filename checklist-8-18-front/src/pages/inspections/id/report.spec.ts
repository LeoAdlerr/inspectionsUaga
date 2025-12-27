import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createTestingPinia } from '@pinia/testing';
import { useInspectionsStore } from '@/stores/inspections';
import ReportPage from './report.vue';

// --- MOCKS ---
vi.mock('vue-router/auto', () => ({
  useRoute: vi.fn(() => ({ params: { id: '123' } })),
  useRouter: vi.fn(() => ({ back: vi.fn() })),
}));
const vuetify = createVuetify();

// --- INÍCIO DA SUÍTE DE TESTES ---
describe('Tela 5: Relatório da Inspeção (report.vue)', () => {

  const mountComponent = (initialState = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        inspections: {
          currentInspection: null,
          currentReportHtml: null,
          ...initialState,
        },
      },
    });
    const store = useInspectionsStore(pinia);
    const wrapper = mount(ReportPage, {
      global: { plugins: [vuetify, pinia] },
    });
    return { wrapper, store };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar as actions para buscar dados da inspeção e o HTML do relatório ao ser montado', () => {
    const { store } = mountComponent();
    expect(store.fetchInspectionById).toHaveBeenCalledWith(123);
    expect(store.fetchReportHtml).toHaveBeenCalledWith(123);
  });

  it('deve exibir os dados do cabeçalho (status, inspetor, motorista) corretamente', async () => {
    const { wrapper, store } = mountComponent();

    // A SOLUÇÃO: Atualizamos o mock para a nova estrutura de dados,
    // com o 'inspector' como um objeto aninhado.
    store.currentInspection = {
      id: 123,
      inspector: { id: 10, fullName: 'Leonardo E2E' }, // <-- Nova estrutura
      driverName: 'Motorista E2E',
      items: [{ statusId: 2 }] // Aprovado
    } as any;

    await wrapper.vm.$nextTick();

    // As asserções agora devem passar
    expect(wrapper.find('[data-testid="inspector-name"]').text()).toBe('Leonardo E2E');
    expect(wrapper.find('[data-testid="driver-name"]').text()).toBe('Motorista E2E');
    expect(wrapper.find('.v-chip').text()).toContain('Resultado: APROVADO');
  });

  // O restante dos testes permanece o mesmo
  it('deve renderizar o iframe com o HTML do relatório quando disponível', async () => {
    const { wrapper, store } = mountComponent();
    store.isLoading = false;
    store.currentInspection = { id: 123 } as any;
    store.currentReportHtml = '<h1>Meu Relatório em HTML</h1>';
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="report-iframe"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="html-error-alert"]').exists()).toBe(false);
  });

  it('deve exibir um alerta de erro se o HTML do relatório não for carregado', async () => {
    const { wrapper, store } = mountComponent();
    store.isLoading = false;
    store.currentInspection = { id: 123 } as any;
    store.currentReportHtml = null;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="report-iframe"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="html-error-alert"]').exists()).toBe(true);
  });

  it('deve chamar a action "downloadReportPdf" ao clicar no botão de baixar', async () => {
    const { wrapper, store } = mountComponent();
    store.isLoading = false;
    store.currentInspection = { id: 123 } as any;
    await wrapper.vm.$nextTick();
    await wrapper.find('[data-testid="download-pdf-btn"]').trigger('click');
    expect(store.downloadReportPdf).toHaveBeenCalledWith(123);
  });
  
  it('deve chamar a função de impressão ao clicar no botão de imprimir', async () => {
    const { wrapper, store } = mountComponent();
    store.isLoading = false;
    store.currentInspection = { id: 123, items: [] } as any; // Adicionado 'items' para evitar erro no computed
    store.currentReportHtml = '<html><body>Relatório</body></html>';
    await wrapper.vm.$nextTick();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    (wrapper.vm as any).reportFrame = { contentWindow: window };
    await wrapper.find('[data-testid="print-btn"]').trigger('click');
    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });
});