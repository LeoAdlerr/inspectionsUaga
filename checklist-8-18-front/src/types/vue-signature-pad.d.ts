/**
 * Este é um "shim" de módulo para 'vue-signature-pad'.
 * Como a biblioteca não fornece seus próprios tipos,
 * nós definimos os métodos que *nós* usamos para que o TypeScript
 * entenda o que estamos fazendo.
 */
declare module 'vue-signature-pad' {
  import type { DefineComponent } from 'vue';

  /**
   * Define a interface da *instância* do componente,
   * permitindo que o TypeScript saiba quais métodos existem no `ref`.
   */
  interface SignaturePadInstance {
    /** Verifica se o pad está vazio. */
    isEmpty: () => boolean;
    
    /** Limpa a assinatura. */
    clearSignature: () => void;
    
    /** * Salva a assinatura.
     * @returns Um objeto contendo a string base64 em `data`.
     */
    saveSignature: (type?: string) => { isEmpty: boolean; data: string };
    
    // Outros métodos (não estamos usando, mas eles existem):
    // undoSignature: () => void;
    // fromDataURL: (dataURL: string) => void;
    // toDataURL: (type?: string) => string;
  }

  // Define o componente Vue
  const VueSignaturePad: DefineComponent<{}, {}, SignaturePadInstance>;
  
  export { VueSignaturePad };
}