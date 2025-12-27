import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createTestingPinia } from '@pinia/testing';
import { useAuthStore } from '@/stores/auth';
import LoginPage from './login.vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
    }),
  };
});

const vuetify = createVuetify();

describe('LoginPage.vue', () => {
  let wrapper: VueWrapper<any>;
  let authStore: ReturnType<typeof useAuthStore>;

  const mountComponent = () => {
    wrapper = mount(LoginPage, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
      },
    });
    authStore = useAuthStore();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mountComponent();
  });

  it('deve renderizar o formulário de login corretamente', () => {
    expect(wrapper.text()).toContain('Plataforma de Inspeções');
    expect(wrapper.find('[data-testid="login-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="password-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="submit-btn"]').exists()).toBe(true);
  });

  it('NÃO deve chamar a action de login se o formulário for inválido', async () => {
    await wrapper.find('form').trigger('submit.prevent');
    expect(authStore.login).not.toHaveBeenCalled();
  });

  it('deve chamar a action de login com as credenciais corretas quando o formulário for válido', async () => {
    (wrapper.vm as any).formRef = {
      validate: vi.fn().mockResolvedValue({ valid: true }),
    };
    await wrapper.find('[data-testid="login-input"] input').setValue('inspetor');
    await wrapper.find('[data-testid="password-input"] input').setValue('senha123');
    await wrapper.find('form').trigger('submit.prevent');
    expect(authStore.login).toHaveBeenCalledWith({
      loginIdentifier: 'inspetor',
      password: 'senha123',
    });
  });

  it('deve exibir o estado de loading no botão durante o login', async () => {
    // Usamos a propriedade 'loginStatus'
    authStore.loginStatus = 'loading';
    await wrapper.vm.$nextTick();
    
    const button = wrapper.find('[data-testid="submit-btn"]');
    expect(button.classes()).toContain('v-btn--loading');
  });

  it('deve exibir uma mensagem de erro quando a store indicar um erro', async () => {
    // Usamos a propriedade 'loginError'
    authStore.loginError = 'Usuário ou senha incorretos.';
    await wrapper.vm.$nextTick();
    
    const alert = wrapper.find('[data-testid="error-alert"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('Usuário ou senha incorretos.');
  });
});