import ResizeObserver from 'resize-observer-polyfill';
import { vi } from 'vitest';

// Torna o ResizeObserver disponível globalmente para os testes
global.ResizeObserver = ResizeObserver;

// MOTIVAÇÃO: O JSDOM (ambiente de teste) não implementa a API visualViewport,
// que é usada por bibliotecas de UI como o Vuetify para o posicionamento de elementos.
// Criamos um "mock" (uma imitação) simples desta API para evitar que os
// componentes do Vuetify quebrem durante os testes

const mockVisualViewport = {
  width: 1920,
  height: 1080,
  scale: 1,
  offsetTop: 0,
  offsetLeft: 0,
  onresize: null,
  onscroll: null,
  // Funções vazias para os event listeners, caso o Vuetify tente usá-los.
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

// Anexamos o nosso mock ao objeto 'window' global do ambiente de teste.
Object.defineProperty(window, 'visualViewport', {
  value: mockVisualViewport,
  writable: true,
  configurable: true,
});
