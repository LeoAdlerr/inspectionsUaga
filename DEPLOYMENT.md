<h1 id="guia-de-deploy">🚢 Guia de Deploy e Publicação</h1>
<p>
    Este documento é o guia completo para a infraestrutura e o processo de implantação da Aplicação de Inspeção Digital no ambiente de homologação.
</p>

<hr>
<h2 id="setup-servidor">Parte 1: Configuração Inicial do Servidor IIS (Executar Apenas Uma Vez)</h2>
<p>
    Os passos a seguir descrevem como configurar um servidor Windows com IIS do zero para hospedar a aplicação. Siga-os na ordem correta.
</p>

<h4><strong>Passo 1: Pré-requisitos do Servidor</strong></h4>
<ul>
    <li>Windows Server com a role IIS devidamente instalada.</li>
    <li>Módulos <strong>iisnode</strong> e <strong>URL Rewrite</strong> para o IIS instalados.</li>
    <li><strong>Git</strong>, <strong>Node.js</strong> e <strong>Yarn</strong> instalados.</li>
    <li>Estrutura de pastas segura criada (ex: código-fonte em <code>C:\deploy\source</code> e web root em <code>C:\inetpub\wwwroot</code>).</li>
    <li>Repositório do projeto clonado na pasta de código-fonte segura.</li>
</ul>

<h4><strong>Passo 2: Criar e Configurar os Application Pools</strong></h4>
<p>Crie pools dedicados para isolar as aplicações.</p>
<ol>
    <li>No Gestor do IIS, crie <code>uaga-inspection-api-pool</code> e <code>uaga-inspection-app-pool</code>.</li>
    <li>Para ambos, configure a versão do ".NET CLR" para <strong><code>No Managed Code</code></strong>.</li>
    <li>Em "Definições Avançadas", configure <strong>Start Mode</strong> para <code>AlwaysRunning</code> e <strong>Idle Time-out</strong> para <code>0</code>.</li>
</ol>

<h4><strong>Passo 3: Criar os Sites no IIS</strong></h4>
<p>Associe os pools e as pastas aos sites.</p>
<ol>
    <li>Crie o site <strong><code>uaga-inspection-api</code></strong> (porta 8888), associado ao pool <code>...api-pool</code> e à pasta <code>...\uaga-inspection-back</code>.</li>
    <li>Crie o site <strong><code>uaga-inspection-app</code></strong> (porta 3000), associado ao pool <code>...app-pool</code> e à pasta <code>...\uaga-inspection-front</code>.</li>
</ol>

<h4><strong>Passo 4: Desbloquear Handlers (Feature Delegation)</strong></h4>
<p>Permita que os `web.config` locais configurem seus próprios manipuladores.</p>
<ol>
    <li>No nó principal do servidor no IIS, abra <strong>"Feature Delegation"</strong>.</li>
    <li>Encontre <strong>"Handler Mappings"</strong> e mude a permissão para <strong><code>Read/Write</code></strong>.</li>
</ol>

<h4><strong>Passo 5: Configurar Variáveis de Ambiente Iniciais</strong></h4>
<p>Este é o momento de fazer as edições manuais nos arquivos que serão servidos pelo IIS.</p>
<p><strong>Para o Backend:</strong> Edite o <code>web.config</code> em <code>C:\inetpub\wwwroot\uaga-inspection-back</code> e preencha a seção <code>&lt;appSettings&gt;</code> com os valores corretos do banco de dados para o ambiente.</p>
<p><strong>Para o Frontend:</strong> Crie o arquivo <code>config.js</code> em <code>C:\inetpub\wwwroot\uaga-inspection-front</code> com o conteúdo <code>window.runtimeConfig = { VITE_API_BASE_URL: 'URL_DA_API' };</code>.</p>

<h4><strong>Passo 6 (CRUCIAL): Configurar Permissões de Escrita nas Pastas</strong></h4>
<p>
    <strong>MOTIVAÇÃO:</strong> Este deve ser o <strong>último passo</strong> da configuração manual. Devido a uma particularidade do ambiente, qualquer alteração manual de arquivos dentro das pastas em <code>C:\inetpub\wwwroot</code> pode fazer com que as permissões do usuário do IIS sejam perdidas.
</p>
<blockquote>
    <p>
        <strong>AVISO IMPORTANTE:</strong> Execute este passo apenas depois de ter a certeza de que todas as outras configurações de arquivos (como o <code>web.config</code> e o <code>config.js</code>) estão finalizadas. O processo de aplicar permissões pode ser demorado.
    </p>
</blockquote>
<ol>
    <li>Navegue até <code>C:\inetpub\wwwroot</code>.</li>
    <li>Para a pasta <code>uaga-inspection-back</code>, conceda a permissão de <strong><code>Modificar</code></strong> ao usuário <strong><code>IIS APPPOOL\uaga-inspection-api-pool</code></strong>.</li>
    <li>Repita o processo para a pasta <code>uaga-inspection-front</code>, concedendo a permissão de <strong><code>Modificar</code></strong> ao usuário <strong><code>IIS APPPOOL\uaga-inspection-app-pool</code></strong>.</li>
</ol>

<p>✅ <strong>Com as permissões definidas, o servidor está pronto para rodar a aplicação.</strong></p>

<hr>
<h2 id="processo-deploy">Parte 2: O Processo de Deploy Automatizado (Recorrente)</h2>

<h3>Motivação e Objetivo do Script <code>deploy.ps1</code></h3>
<p>
    O script <strong><code>deploy.ps1</code></strong> é a nossa "ferramenta de deploy de um clique", projetado para automatizar 100% o fluxo de atualização do ambiente de forma segura e consistente.
</p>

<h3>Como Executar o Script</h3>
<ol>
    <li>Aceda ao servidor de homologação e abra um terminal <strong>PowerShell como Administrador</strong>.</li>
    <li>Navegue até à pasta raiz do repositório (ex: <code>cd C:\deploy\source\checklistBalanca</code>).</li>
    <li>
        (Se necessário) Libere a execução de scripts para a sessão atual:
        <pre><code>Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass</code></pre>
    </li>
    <li>
        Execute o script:
        <pre><code>.\deploy.ps1</code></pre>
    </li>
</ol>

<h3>O Que o Script Faz? (Análise Detalhada)</h3>
<p>
    A seguir, uma explicação de cada etapa que o script <code>deploy.ps1</code> v5.0 automatiza.
</p>
<ol>
    <li><strong>Atualização do Código-Fonte:</strong> Garante que está na branch `main` e executa um `git pull`.</li>
    <li><strong>Construção do Backend:</strong> Instala as dependências e compila o código TypeScript para JavaScript, verificando se a pasta `/dist` foi criada.</li>
    <li><strong>Implantação do Backend:</strong> Cria a pasta de destino no IIS (se necessário) e copia os arquivos de produção (`dist`, `node_modules`, `web.config`, etc.).</li>
    <li><strong>Construção do Frontend:</strong> Instala as dependências e compila a aplicação Vue, gerando os arquivos estáticos na pasta `/dist`.</li>
    <li><strong>Implantação do Frontend:</strong> Cria a pasta de destino e usa `robocopy` para espelhar a pasta `/dist` no destino, **excluindo** o `config.js` de exemplo do repositório.</li>
    <li><strong>Cópia do `web.config` do Frontend:</strong> Copia o `web.config` (com as regras de rewrite) para a pasta de destino.</li>
    <li><strong>Geração do `config.js` de Runtime:</strong> Cria dinamicamente o arquivo `config.js` no servidor com a URL da API correta para o ambiente.</li>
    <li><strong>Correção de Permissões (Backend):</strong> Executa `icacls` para garantir que o AppPool do backend tenha as permissões corretas na sua pasta.</li>
    <li><strong>Correção de Permissões (Frontend):</strong> Executa `icacls` para garantir que o AppPool do frontend tenha as permissões corretas na sua pasta.</li>
</ol>

<hr>
<h2 id="limitacoes">Limitações Atuais e Visão de Futuro</h2>
<p>
    O script na sua versão atual implanta a versão mais recente da branch `main` e não contempla um processo de rollback automatizado para versões (tags) anteriores.
</p>