// Este arquivo informa ao TypeScript que esperamos encontrar um objeto 'runtimeConfig'
// na 'window' global, evitando erros de tipo durante o desenvolvimento.
export {};

declare global {
  interface Window {
    runtimeConfig: {
      VITE_API_BASE_URL: string;
    };
  }
}