<div align="center">
    <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="150"
            alt="Nest Logo" /></a>
    <h1 align="center">Documentação do Backend - Inspeção Digital 8/18</h1>
    <p align="center">
        <img src="https://img.shields.io/badge/NestJS-10.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white"
            alt="NestJS">
        <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white"
            alt="TypeScript">
        <img src="https://img.shields.io/badge/Tests-100%25-brightgreen?style=for-the-badge&logo=jest" alt="Testes">
    </p>
</div>

<h2 id="visao-geral">📜 Visão Geral</h2>
<p>
    Bem-vindo à API do sistema de Inspeção Digital. Este serviço, construído com <strong>NestJS</strong>, é o coração da
    aplicação, responsável por toda a lógica de negócio, processamento de dados e interações com a infraestrutura (banco
    de dados, sistema de arquivos, etc.).
</p>
<p>
    Sua arquitetura foi desenhada com foco em <strong>qualidade, testabilidade e manutenibilidade</strong>, utilizando
    padrões como Clean Architecture e Domain-Driven Design (DDD).
</p>

<h2 id="sumario">📖 Sumário</h2>
<ul>
    <li><a href="#guia-rapido">Guia Rápido (Como Começar)</a></li>
    <li><a href="#guia-de-contribuicao">Guia de Contribuição (Específico do Backend)</a>
        <ul>
            <li><a href="#desenvolvimento-paralelo">Trabalhando sem Bloqueios (Frontend & BD)</a></li>
            <li><a href="#testes">A Importância dos Testes</a></li>
            <li><a href="#padroes-codigo">Padrões de Código</a></li>
        </ul>
    </li>
    <li><a href="#arquitetura-detalhada">Arquitetura Detalhada: Clean Architecture & DDD</a></li>
    <li><a href="#autenticacao-autorizacao">Autenticação e autorização</a></li>
    <li><a href="#estrutura-de-pastas">Estrutura de Pastas</a></li>
    <li><a href="#referencia-api">Referência da API (Swagger)</a></li>
    <li><a href="#apendice">Guias Avanaçados e Stack Tecnológico Completo</a></li>
</ul>

<hr>

<h2 id="guia-rapido">🚀 Guia Rápido (Como Começar)</h2>
<p>
    A forma mais rápida e recomendada de executar o ambiente de desenvolvimento é via contêiner, que já inclui o banco
    de dados e o pipeline de testes.
</p>
<h3 id="como-rodar-backend">Como Rodar e Validar o Ambiente Containerizado(Recomendado)</h3>
<p>
    Nosso ambiente containerizado para o backend é <strong>100% autossuficiente</strong>. Ele inclui a API e seu próprio banco de dados de teste. Para iniciar, navegue até a pasta <code>/checklist-8-18-back</code> e utilize um dos comandos abaixo.
</p>

<h4>Cenário 1: Desenvolvimento do Dia a Dia (Foco em Lógica de Negócio)</h4>
<p>
    Este é o modo padrão para codificar novas features, depurar e rodar os testes mais rápidos.
</p>
<pre><code>podman-compose up --build</code></pre>
<p>
    Ao executar este comando, o <code>entrypoint.sh</code> irá:
</p>
<ol>
    <li>Iniciar um contêiner para a API e um contêiner para o banco de dados de teste (MySQL).</li>
    <li>Aguardar até que o banco de dados esteja pronto para aceitar conexões.</li>
    <li>Executar a suíte de <strong>testes unitários e de integração</strong> (<code>yarn test</code>).</li>
    <li>Se os testes passarem, ele iniciará o <strong>servidor da API NestJS</strong> em modo de desenvolvimento.</li>
    <li>A API estará então acessível em <code>http://localhost:8888</code>, com hot-reload ativado.</li>
</ol>

<h4>Cenário 2: Validando o Fluxo Completo (Executando Testes E2E)</h4>
<p>
    Use este comando antes de abrir uma Pull Request para garantir que a sua feature não quebrou nenhum fluxo de usuário de ponta a ponta.
</p>
<pre><code>RUN_E2E=true podman-compose up --build</code></pre>
<p>
    Ao passar a variável <code>RUN_E2E=true</code>, o <code>entrypoint.sh</code> executa a <strong>pipeline de validação completa</strong>:
</p>
<ol>
    <li>Executa os <strong>testes unitários e de integração</strong>.</li>
    <li>Se passarem, executa o <strong>build de produção</strong> (<code>yarn build</code>).</li>
    <li>Se o build for bem-sucedido, ele executa a sua suíte de <strong>testes E2E</strong> (<code>yarn test:e2e</code>).</li>
    <li>Ao final, o processo é encerrado com sucesso ou falha.</li>
</ol>
<p>
    ✅ Após a inicialização, a documentação interativa da API (Swagger) estará disponível em <a
        href="http://localhost:8888/api/docs"><strong>http://localhost:8888/api/docs</strong></a>.
</p>
<p>
    Para instruções de execução local (Node.js na máquina) ou em modo de produção, consulte o <strong><a
            href="#ambiente-de-desenvolvimento-avancado">Guia de Ambiente Avançado</a></strong>.
</p>

<details>
  <summary>⚠️ <strong>Atenção:</strong> Comportamento do Endpoint de Geração de PDF</summary>
  <br>
  <p>
    O endpoint <code>GET /inspections/:id/report/pdf</code> possui uma <strong>dependência fundamental</strong> da biblioteca Puppeteer, que por sua vez requer acesso a uma instância executável do navegador Google Chrome (ou Chromium) no ambiente do servidor.
  </p>
  <p>
    Devido a esta dependência, o comportamento do endpoint varia conforme o ambiente de implantação:
  </p>
  <ul>
    <li>
      ✅ <strong>Funciona Corretamente:</strong> Em ambientes de <strong>desenvolvimento local</strong> e <strong>containerizados (Docker/Podman)</strong>, onde o Puppeteer consegue aceder facilmente ao Chrome, o endpoint irá gerar e retornar o PDF com sucesso (<code>200 OK</code>).
    </li>
    <li>
      ❌ <strong>Falha Esperada:</strong> Em ambientes de servidor mais restritivos, como uma <strong>implantação padrão no IIS</strong>, o processo do Node.js geralmente não tem as permissões necessárias para iniciar o processo do Chrome. Nestes casos, o endpoint irá falhar intencionalmente com um erro <code>500 Internal Server Error</code>.
    </li>
  </ul>
  <p>
    <strong>Alternativa Recomendada para Ambientes Restritivos:</strong>
    <br>
    Para obter o relatório em PDF nestes ambientes, a abordagem recomendada é utilizar o endpoint <code>GET /inspections/:id/report/html</code> para carregar a versão HTML do relatório e, em seguida, usar a funcionalidade nativa do navegador <strong>"Imprimir > Guardar como PDF"</strong>.
  </p>
</details>
<hr>

<h2 id="guia-de-contribuicao">🤝 Guia de Contribuição (Específico do Backend)</h2>
<p>
    Para as diretrizes gerais do projeto (branching, PRs, DoD, etc.), consulte o <a href="../CONTRIBUTING.md">Guia de
        Contribuição Principal</a>. Abaixo estão as nuances específicas para o desenvolvimento do backend.
</p>

<h3 id="desenvolvimento-paralelo">Trabalhando sem Bloqueios (Frontend & Banco de Dados)</h3>
<p>
    Nossa filosofia é que o desenvolvimento do backend <strong>não deve ser um gargalo</strong>. Seguimos dois
    princípios para habilitar o trabalho paralelo:
</p>
<ol>
    <li>
        <strong>O Backend Define o Contrato para o Frontend:</strong><br>
        Assim que uma nova funcionalidade é planejada, a primeira tarefa do backend é definir o <strong>contrato da
            API</strong>. Isso significa criar o Controller, os DTOs (Data Transfer Objects) com validações
        (<code>class-validator</code>) e documentar o endpoint no Swagger. Com este contrato claro, o <strong>time de
            Frontend pode começar a trabalhar imediatamente</strong>, mockando as chamadas da API sem precisar que a
        lógica de negócio esteja pronta.
    </li>
    <li>
        <strong>O Backend Trabalha com um Contrato do Banco de Dados:</strong><br>
        O backend não precisa esperar que o DBA aplique novas migrações. Com base no <a
            href="../checklist-8-18-bd/README.md">Dicionário de Dados</a>, criamos as <strong>Interfaces de Repositório
            (Portas)</strong> e as <strong>Entidades do TypeORM</strong>. Durante o desenvolvimento, podemos usar um
        repositório "em memória" (mock) para construir e testar toda a lógica de negócio (Use Cases) de forma isolada e
        desacoplada da implementação real do banco.
    </li>
</ol>

<h3 id="testes">A Cultura de Testes</h3>
<p>
    Testes não são opcionais. <strong>100% dos Use Cases devem ter testes unitários</strong> que validem a lógica de
    negócio de forma isolada. Funcionalidades críticas também devem ser cobertas por <strong>testes E2E</strong>, que
    simulam uma chamada HTTP real e verificam a integração de todas as camadas.
</p>
<p>
    Use os comandos <code>yarn test</code> para testes unitários e <code>yarn test:e2e</code> para os testes End-to-End.
    Lembre-se que o pipeline de CI no contêiner executa ambos antes de iniciar a aplicação.
</p>

<h3 id="padroes-codigo">Padrões de Código</h3>
<ul>
    <li><strong>Siga a Arquitetura:</strong> Respeite a separação de camadas. Controllers chamam Use Cases. Use Cases
        dependem de Interfaces de Repositório. A Infraestrutura implementa as interfaces.</li>
    <li><strong>DTOs para Tudo:</strong> Toda entrada e saída de dados na camada de API deve ser feita através de DTOs.
        Nunca exponha as entidades do domínio diretamente.</li>
    <li><strong>Injeção de Dependência:</strong> Sempre use o sistema de DI do NestJS. Evite instanciar classes
        manualmente com <code>new</code>.</li>
</ul>

<hr>

<h2 id="arquitetura-detalhada">🏛️ Arquitetura Detalhada: Clean Architecture & DDD</h2>
<p>
    A arquitetura desta API é o seu maior diferencial, projetada com <strong>Clean Architecture</strong> e
    <strong>Domain-Driven Design (DDD)</strong> para criar um sistema desacoplado, testável e manutenível. O princípio
    fundamental é a <strong>Regra da Dependência</strong>: as setas de dependência apontam sempre para o centro, para o
    domínio.
</p>
<hr>

<h2 id="autenticacao-autorizacao">🔑 Autenticação e Autorização (RBAC)</h2>
<p>
    A aplicação implementa um sistema robusto de autenticação e autorização para garantir que os dados estejam seguros e que cada usuário possa aceder apenas às funcionalidades do seu perfil.
</p>
<p>
    A arquitetura é baseada no padrão <strong>Role-Based Access Control (RBAC)</strong> e utiliza o ecossistema do <strong>Passport.js</strong> com estratégias de <strong>JWT (JSON Web Token)</strong>, seguindo as melhores práticas do NestJS.
</p>

<h4>Perfis de Usuário (Roles)</h4>
<p>O sistema foi desenhado para suportar 5 perfis de usuário distintos, cada um com as suas responsabilidades no fluxo de inspeção:</p>
<ul>
    <li><strong>ADMIN:</strong> Acesso total ao sistema, incluindo a gestão de outros usuários.</li>
    <li><strong>DOCUMENTAL:</strong> Responsável por criar e validar as inspeções.</li>
    <li><strong>INSPECTOR:</strong> Responsável por executar o checklist de inspeção.</li>
    <li><strong>CONFERENTE:</strong> Responsável pelos processos de lacração e carregamento.</li>
    <li><strong>PORTARIA:</strong> Responsável pela verificação final na saída.</li>
</ul>

<h4>Componentes da Arquitetura</h4>
<p>
    A funcionalidade está dividida em dois módulos principais para uma clara separação de responsabilidades:
</p>
<ul>
    <li>
        <strong><code>AuthModule</code>:</strong> Dedicado exclusivamente à <strong>autenticação</strong>.
        <ul>
            <li><strong>AuthController:</strong> Expõe o endpoint público <code>POST /auth/login</code>.</li>
            <li><strong>AuthService:</strong> Contém a lógica para validar credenciais (usando <code>bcrypt</code> para comparar senhas) e gerar tokens JWT.</li>
            <li><strong>Strategies (Local & JWT):</strong> Implementações do Passport.js que definem COMO validar um login local e COMO validar um token JWT em requisições subsequentes.</li>
        </ul>
    </li>
    <li>
        <strong><code>UsersModule</code>:</strong> Dedicado à <strong>gestão (CRUD) de usuários</strong>.
        <ul>
            <li><strong>UsersController:</strong> Expõe os endpoints protegidos para criar, listar, atualizar e desativar usuários (ex: <code>GET /users</code>, <code>POST /users</code>).</li>
            <li><strong>UsersService:</strong> Contém a lógica de negócio para interagir com a base de dados de usuários.</li>
        </ul>
    </li>
    <li>
        <strong><code>Guards</code> (Porteiros):</strong> Mecanismos do NestJS que protegem os endpoints.
         <ul>
            <li><strong>JwtAuthGuard:</strong> Garante que um usuário está autenticado (ou seja, possui um token JWT válido). É aplicado a quase toda a API.</li>
            <li><strong>RolesGuard:</strong> Verifica se o usuário autenticado tem a <code>role</code> necessária para aceder a um recurso específico (ex: apenas um 'ADMIN' pode aceder ao <code>UsersController</code>).</li>
        </ul>
    </li>
</ul>

<h4>Fluxo de Autenticação</h4>
<ol>
    <li>O cliente envia as credenciais (email/senha) para <code>POST /api/auth/login</code>.</li>
    <li>A <strong>LocalStrategy</strong> valida as credenciais contra o banco de dados usando o <strong>AuthService</strong>.</li>
    <li>Se as credenciais forem válidas, o <strong>AuthService</strong> gera um <strong>access_token</strong> JWT.</li>
    <li>O token é retornado ao cliente.</li>
    <li>Para aceder a endpoints protegidos (ex: <code>GET /api/inspections</code>), o cliente envia o token no cabeçalho <code>Authorization: Bearer &lt;token&gt;</code>.</li>
    <li>O <strong>JwtAuthGuard</strong> intercepta a requisição, e a <strong>JwtStrategy</strong> valida o token.</li>
    <li>Se o token for válido, a requisição é autorizada e processada.</li>
</ol>
<div align="center">
</div>
<p>Para uma análise aprofundada das decisões de arquitetura e diagramas de classe/sequência, consulte o <strong><a
            href="#documentacao-avancada">Apêndice de Documentação Avançada</a></strong>.</p>

<hr>

<h2 id="estrutura-de-pastas">📁 Estrutura de Pastas</h2>
<p>
    A estrutura de pastas reflete diretamente a Clean Architecture, com uma pasta <code>/test</code> que espelha a de
    <code>/src</code>.
</p>
<pre><code>
├── src/
│    ├── api/       (Controllers, DTOs)
│   ├── domain/    (Models, Use Cases, Ports)
│   ├── infra/     (Adapters: TypeORM, etc.)
│   └── modules/   (Módulos do NestJS)
└── test/
    ├── unit/
    └── e2e/
</code></pre>

<ul>
      <li>
            <code><strong>/src</strong></code>: Contém todo o código-fonte da aplicação.
            <ul>
                  <li><code>/api</code>: A <strong>Camada de Apresentação</strong> (Controllers, DTOs, Pipes).</li>
                  <li><code>/domain</code>: O <strong>Coração do Negócio</strong> (Models, Use Cases, Ports,
                Repositories).</li>
                  <li><code>/infra</code>: Os <strong>Detalhes de Implementação</strong> (TypeORM, File System, PDF).
            </li>
                  <li><code>/modules</code>: Os <strong>Módulos do NestJS</strong> que organizam a injeção de
                dependência.</li>
                </ul>
          </li>
      <li>
            <code><strong>/test</strong></code>: Contém todos os testes automatizados da aplicação.
            <ul>
                  <li>
                        <code>/unit</code>: Testes <strong>Unitários e de Integração</strong>.
                        <ul>
                              <li>A sua estrutura espelha a de <code>src/</code>. Por exemplo, os testes para os Use
                        Cases em <code>src/domain/use-cases</code> encontram-se em
                        <code>test/unit/domain/use-cases</code>.</li>
                              <li>Isto inclui testes isolados para <strong>Use Cases</strong> (regras de negócio),
                        <strong>Controllers</strong> (camada HTTP) e <strong>Services</strong> da infraestrutura
                        (adaptadores).</li>
                            </ul>
                      </li>
                  <li>
                        <code>/e2e</code>: Testes <strong>End-to-End</strong>.
                        <ul>
                              <li>Estes testes iniciam uma instância completa da aplicação e interagem com a API e o
                        banco de dados de teste para validar os fluxos de usuário de ponta a ponta.</li>
                            </ul>
                      </li>
                  <li><code>jest-e2e.json</code>: Ficheiro de configuração específico para a execução dos testes E2E.
            </li>
                </ul>
          </li>
</ul>

<hr>

<h2 id="referencia-api">📡 Referência da API (Swagger)</h2>
<p>
    Após iniciar a aplicação, a documentação completa e interativa da API está disponível em:<br>
    <a href="http://localhost:8888/api/docs"><strong>http://localhost:8888/api/docs</strong></a>
</p>
<details>
      <summary><strong>Clique para expandir a lista de Endpoints da API (Atualizada)</strong></summary>
      <p>A seguir, a lista consolidada dos endpoints da API, incluindo os novos fluxos de Conferência e Lacração.</p>
      <table border="1" style="border-collapse: collapse; width:100%;">
            <thead>
                <tr>
                    <th align="left">Método</th>
                    <th align="left">Endpoint</th>
                    <th align="left">Descrição</th>
                </tr>
            </thead>
            <tbody>
                <tr bgcolor="#f8f9fa">
                    <td colspan="3" align="center"><strong>1. Autenticação e Gestão de Usuários</strong></td>
                </tr>
                <tr>
                    <td><code>POST</code></td>
                    <td><code>/auth/login</code></td>
                    <td>Autentica um usuário e retorna o token JWT.</td>
                </tr>
                <tr>
                    <td><code>PATCH</code></td>
                    <td><code>/auth/change-my-password</code></td>
                    <td>Permite a um usuário logado alterar a sua própria senha.</td>
                </tr>
                <tr>
                    <td><code>GET</code></td>
                    <td><code>/users</code></td>
                    <td>Lista usuários com filtros (Admin/Doc).</td>
                </tr>
                <tr>
                    <td><code>GET</code></td>
                    <td><code>/users/:id</code></td>
                    <td>Busca um usuário específico.</td>
                </tr>
                <tr>
                    <td><code>POST</code></td>
                    <td><code>/users</code></td>
                    <td>Cria um novo usuário.</td>
                </tr>
                <tr>
                    <td><code>PATCH</code></td>
                    <td><code>/users/:id</code></td>
                    <td>Atualiza dados de um usuário.</td>
                </tr>
                <tr>
                    <td><code>POST</code></td>
                    <td><code>/users/:id/reset-password</code></td>
                    <td>Redefine senha de usuário.</td>
                </tr>
                <tr>
                    <td><code>DELETE</code></td>
                    <td><code>/users/:id</code></td>
                    <td>Desativa um usuário.</td>
                </tr>
                <tr>
                    <td><code>GET</code></td>
                    <td><code>/roles</code></td>
                    <td>Lista papéis de usuário.</td>
                </tr>
                <tr bgcolor="#f8f9fa">
                    <td colspan="3" align="center"><strong>2. Lookups (Dados de Suporte)</strong></td>
                </tr>
                <tr>
                    <td><code>GET</code></td>
                    <td><code>/lookups/:type</code></td>
                    <td>Busca listas de apoio (status, modalidades, tipos de container, etc).</td>
                </tr>
                <tr bgcolor="#f8f9fa">
                    <td colspan="3" align="center"><strong>3. Gestão de Inspeções (Ciclo de Vida)</strong></td>
                </tr>
                <tr>
                    <td><code>POST</code></td>
                    <td><code>/inspections/check-existing</code></td>
                    <td>Verifica duplicidade de inspeção.</td>
                </tr>
                <tr>
                    <td><code>POST</code></td>
                    <td><code>/inspections</code></td>
                    <td><strong>Cria uma nova inspeção (Status: Aguardando).</strong></td>
                </tr>
                <tr>
                    <td><code>GET</code></td>
                    <td><code>/inspections</code></td>
                    <td>Lista inspeções.</td>
                </tr>
                <tr>
                    <td><code>GET</code></td>
                    <td><code>/inspections/:id</code></td>
                    <td>Retorna os detalhes completos.</td>
                </tr>
                <tr>
                    <td><code>PATCH</code></td>
                    <td><code>/inspections/:id</code></td>
                    <td>Atualiza cabeçalho da inspeção.</td>
                </tr>
                <tr>
                    <td><code>DELETE</code></td>
                    <td><code>/inspections/:id</code></td>
                    <td>Apaga uma inspeção (fase inicial).</td>
                </tr>
                <tr>
                    <td><code>PATCH</code></td>
                    <td><code>/inspections/:id/assign</code></td>
                    <td>Atribui uma inspeção a um inspetor.</td>
                </tr>
                <tr bgcolor="#f8f9fa">
                    <td colspan="3" align="center"><strong>4. Fluxo do Inspetor (Checklist e Lacração)</strong></td>
                </tr>
                <tr>
                    <td><code>PATCH</code></td>
                    <td><code>/inspections/:id/points/:number</code></td>
                    <td>Atualiza item do checklist.</td>
                </tr>
                <tr>
                    <td><code>POST</code></td>
                    <td><code>/inspections/:id/points/:number/evidence</code></td>
                    <td>Upload de evidência para um ponto.</td>
                </tr>
                <tr>
                    <td><code>DELETE</code></td>
                    <td><code>/inspections/:id/points/:number/evidence</code></td>
                    <td>Apaga evidência do checklist.</td>
                </tr>
                <tr>
                    <td><code>POST</code></td>
                    <td><code>/inspections/:id/signatures</code></td>
                    <td>Anexa assinaturas (Inspetor, Motorista).</td>
                </tr>
                <tr>
                    <td><code>POST</code></td>
                    <td><code>/inspections/:id/driver-signature</code></td>
                    <td>Anexa assinatura motorista (Base64).</td>
                </tr>
                <tr>
                    <td><code>PATCH</code></td>
                    <td><code>/inspections/:id/finalize</code></td>
                    <td><strong>Finaliza Checklist.</strong> Aplica "Regra de Ouro" (Aprova/Reprova).</td>
                </tr>
                <tr>
                    <td><code>PATCH</code></td>
                    <td><code>/inspections/:id/seal-initial</code></td>
                    <td><strong>Lacração Inicial.</strong> Envia múltiplos lacres/fotos e move para Conferência.</td>
                </tr>
                <tr>
                    <td><code>PATCH</code></td>
                    <td><code>/inspections/:id/seals/:sealId</code></td>
                    <td>Corrige número ou foto de lacre (Inspetor).</td>
                </tr>
                <tr>
                    <td><code>DELETE</code></td>
                    <td><code>/inspections/:id/seals/:sealId</code></td>
                    <td>Remove lacre incorreto (Inspetor).</td>
                </tr>
                <tr>
                    <td><code>PATCH</code></td>
                    <td><code>/inspections/:id/images/:imageId</code></td>
                    <td>Corrige foto de placa/container (Inspetor).</td>
                </tr>
                <tr>
                    <td><code>DELETE</code></td>
                    <td><code>/inspections/:id/images/:imageId</code></td>
                    <td>Remove foto de placa/container (Inspetor).</td>
                </tr>
                <tr bgcolor="#f8f9fa">
                    <td colspan="3" align="center"><strong>5. Fluxo do Conferente (Carregamento)</strong></td>
                </tr>
                <tr>
                    <td><code>POST</code></td>
                    <td><code>/inspections/:id/start-loading</code></td>
                    <td><strong>Check-in.</strong> Inicia conferência, registra timestamp e muda status para EM CONFERÊNCIA.</td>
                </tr>
                <tr>
                    <td><code>PATCH</code></td>
                    <td><code>/inspections/:id/finish-loading</code></td>
                    <td><strong>Finaliza Conferência.</strong> Registra lacres finais (saída) e define status final Aprovado/Reprovado.</td>
                </tr>
                <tr>
                    <td><code>DELETE</code></td>
                    <td><code>/inspections/:id/conference-seals/:sealId</code></td>
                    <td>Remove lacre de saída (Conferente).</td>
                </tr>
                <tr>
                    <td><code>PATCH</code></td>
                    <td><code>/inspections/:id/conference-seals/:sealId</code></td>
                    <td>Corrige lacre de saída (Conferente).</td>
                </tr>
                <tr>
                    <td><code>DELETE</code></td>
                    <td><code>/inspections/:id/conference-images/:imageId</code></td>
                    <td>Remove foto panorâmica (Conferente).</td>
                </tr>
                <tr>
                    <td><code>PATCH</code></td>
                    <td><code>/inspections/:id/conference-images/:imageId</code></td>
                    <td>Corrige foto panorâmica (Conferente).</td>
                </tr>
                <tr bgcolor="#f8f9fa">
                    <td colspan="3" align="center"><strong>6. Ações Administrativas (Documental)</strong></td>
                </tr>
                <tr>
                    <td><code>POST</code></td>
                    <td><code>/inspections/:id/override-approval</code></td>
                    <td><strong>Override.</strong> Força aprovação de inspeção reprovada (com justificativa).</td>
                </tr>
                <tr bgcolor="#f8f9fa">
                    <td colspan="3" align="center"><strong>7. Relatórios</strong></td>
                </tr>
                <tr>
                    <td><code>GET</code></td>
                    <td><code>/inspections/:id/report/html</code></td>
                    <td>Visualização HTML do relatório.</td>
                </tr>
                <tr>
                    <td><code>GET</code></td>
                    <td><code>/inspections/:id/report/pdf</code></td>
                    <td>Gera e baixa o relatório PDF completo.</td>
                </tr>
            </tbody>
      </table>
</details>

<h2 id="apendice">📚 Apêndice: Guias Avançados</h2>

<details>
    <summary><strong>Clique para expandir: Guia de Ambiente Avançado (Local, Produção, Deploy)</strong></summary>
    <h3 id="ambiente-de-desenvolvimento-avancado">Ambiente de Desenvolvimento Avançado</h3>
    <p>
        Para desenvolvedores que preferem rodar o Node.js diretamente na máquina host.
    </p>
    <h4>Pré-requisitos</h4>
    <ul>
        <li>
            <strong>Node.js:</strong> Versão 20 ou superior. Recomenda-se o uso de um gestor de versões como o <a
                href="https://github.com/nvm-sh/nvm">nvm</a> para instalar e gerir as versões do Node.js.
        </li>
        <li>
            <strong>Yarn:</strong> Gestor de pacotes do projeto. (<a
                href="https://yarnpkg.com/getting-started/install">Instalação</a>)
        </li>
        <li>
            <strong>Instância MySQL:</strong> Um servidor de banco de dados MySQL deve estar a correr e acessível a
            partir da sua máquina. Pode usar o contêiner do passo anterior (<code>podman-compose up -d db</code>) ou uma
            instalação local.
        </li>
    </ul>
    <h4>Instruções Passo a Passo</h4>
    <ol>
        <li>
            <strong>Instale as Dependências:</strong>
            <pre><code>yarn install</code></pre>
        </li>
        <li>
            <strong>Configure as Variáveis de Ambiente:</strong>
            <p>Copie o ficheiro <code>.env.example</code> para <code>.env</code> e preencha com as credenciais do seu
                banco de dados local (ex: <code>DB_HOST=localhost</code>).</p>
            <pre><code>cp .env.example .env</code></pre>
        </li>
        <li>
            <strong>Execute o Pipeline de Qualidade (Manual):</strong><br>
            Para simular o nosso CI e garantir a qualidade do seu código, execute os testes na mesma ordem que o
            ambiente containerizado faria.
            <p>Primeiro, os testes unitários:</p>
            <pre><code>yarn test</code></pre>
            <p>Depois, os testes End-to-End (garanta que o seu <code>.env</code> aponta para um banco de dados de
                teste):</p>
            <pre><code>yarn test:e2e</code></pre>
        </li>
        <li>
            <strong>Inicie o Servidor de Desenvolvimento:</strong>
            <p>Se todos os testes passaram, inicie o servidor em modo de desenvolvimento com hot-reload.</p>
            <pre><code>yarn start:dev</code></pre>
        </li>
    </ol>
    <hr>
    <h3>Executando em Modo de Produção</h3>
    <p>
        Para executar a aplicação num ambiente de produção, o processo é diferente. Não usamos o modo de desenvolvimento
        (`start:dev`), mas sim o código transpilado e otimizado.
    </p>
    <ol>
        <li>
            <strong>Gere o Build de Produção:</strong><br>
            Este comando transpila o código TypeScript para JavaScript puro numa pasta <code>/dist</code>.
            <pre><code>yarn build</code></pre>
        </li>
        <li>
            <strong>Inicie a Aplicação em Modo de Produção:</strong><br>
            Este comando executa o ficheiro <code>main.js</code> a partir da pasta <code>/dist</code> usando o Node.js.
            <pre><code>yarn start:prod</code></pre>
        </li>
    </ol>
    <blockquote>
        <p>
            <strong>Nota Importante:</strong> Para um ambiente de produção real, é altamente recomendável utilizar um
            gestor de processos como o <a href="https://pm2.keymetrics.io/">PM2</a>. Ele garante que a sua aplicação
            reinicie automaticamente em caso de falhas, além de oferecer balanceamento de carga, monitorização e gestão
            de logs. <br>Exemplo com PM2: <code>pm2 start dist/main.js --name "checklist-api"</code>
        </p>
    </blockquote>
    <h3 id="deploy-em-producao-iis">🚢 Deploy em Produção (IIS)</h3>
    <p>Guia preliminar para a publicação da aplicação em um ambiente Windows Server com IIS.</p>
    <h3>Pré-requisitos no Servidor</h3>
    <ul>
        <li><strong>IIS</strong> com o módulo <strong>URL Rewrite</strong> instalado.</li>
        <li><strong><a href="https://github.com/tjanczuk/iisnode">iisnode</a></strong>: Módulo para hospedar aplicações
            Node.js no IIS.</li>
        <li><strong>Node.js</strong> (versão LTS) instalado no servidor.</li>
    </ul>
    <h3>Passos para o Deploy</h3>
    <ol>
        <li><strong>Build da Aplicação:</strong> Gere a versão de produção com <code>yarn build</code>.</li>
        <li><strong>Transferência de Ficheiros:</strong> Copie a pasta <code>/dist</code>, <code>node_modules</code> e
            <code>package.json</code> para uma pasta no servidor (ex: <code>C:\inetpub\wwwroot\checklist-api</code>).
        </li>
        <li><strong>Configurar o IIS:</strong> Crie um novo Site no IIS apontando para a pasta do projeto. Configure o
            seu Application Pool para "No Managed Code".</li>
        <li><strong>Criar o <code>web.config</code>:</strong> Crie um ficheiro <code>web.config</code> na raiz da pasta
            no servidor. Este ficheiro instrui o IIS a usar o iisnode para lidar com as requisições.
            <pre><code>&lt;configuration&gt;
&lt;system.webServer&gt;
&lt;handlers&gt;
&lt;add name="iisnode" path="main.js" verb="*" modules="iisnode" /&gt;
&lt;/handlers&gt;
&lt;rewrite&gt;
&lt;rules&gt;
&lt;rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true"&gt;
&lt;match url="^main.js/debug[/]?" /&gt;
&lt;/rule&gt;
&lt;rule name="DynamicContent"&gt;
&lt;conditions&gt;
&lt;add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True" /&gt;
&lt;/conditions&gt;
&lt;action type="Rewrite" url="main.js" /&gt;
&lt;/rule&gt;
&lt;/rules&gt;
&lt;/rewrite&gt;
&lt;!-- Outras configurações como logging do iisnode podem ser adicionadas aqui --&gt;
&lt;/system.webServer&gt;
&lt;/configuration&gt;
</code></pre>
        </li>
        <li><strong>Variáveis de Ambiente:</strong> Configure as variáveis de ambiente (conexão com o banco de produção,
            JWT_SECRET, etc.) no painel de configuração do site no IIS ou diretamente no <code>web.config</code>.</li>
    </ol>
</details>

<hr>

<details>
    <summary><strong>Clique para expandir: Stack Tecnológico Completo</strong></summary>
    <h3 id="stack-tecnologico">🛠️ Stack Tecnológico</h3>
    <table border="1" style="border-collapse: collapse; width:100%;">
        <thead bgcolor="#f2f2f2">
            <tr>
                <th align="left">Categoria</th>
                <th align="left">Tecnologia/Ferramenta</th>
                <th align="left">Propósito</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Framework Principal</td>
                <td><strong>NestJS 10.x</strong></td>
                <td>Estrutura da aplicação, DI, modularidade.</td>
            </tr>
            <tr>
                <td>Linguagem</td>
                <td><strong>TypeScript 5.x</strong></td>
                <td>Tipagem estática e funcionalidades modernas de JS.</td>
            </tr>
            <tr>
                <td>Acesso a Dados</td>
                <td><strong>TypeORM</strong></td>
                <td>ORM para interação com o banco de dados.</td>
            </tr>
            <tr>
                <td>Banco de Dados</td>
                <td><strong>MySQL 8.0</strong></td>
                <td>Persistência dos dados relacionais.</td>
            </tr>
            <tr>
                <td>Testes</td>
                <td><strong>Jest & Supertest</strong></td>
                <td>Testes unitários, de integração e E2E.</td>
            </tr>
            <tr>
                <td>Serviços Auxiliares</td>
                <td><strong>Puppeteer / Multer</strong></td>
                <td>Geração de PDF e upload de ficheiros.</td>
            </tr>
            <tr>
                <td>Containerização</td>
                <td><strong>Docker / Podman</strong></td>
                <td>Ambiente de desenvolvimento e CI.</td>
            </tr>
        </tbody>
    </table>
</details>

<hr>

<details>
    <summary><strong>Clique para expandir: Documentação Avançada de Arquitetura</strong></summary>
    <h3 id="documentacao-avancada">💡 Filosofia e Diagramas de Arquitetura</h3>
    <p>Aprofundamento nas decisões de arquitetura e diagramas de classe/sequência que modelam o sistema.</p>
    <p>
  Os diagramas a seguir não são apenas documentação; são a representação visual da nossa filosofia de arquitetura. Eles mostram como os princípios de <strong>Clean Architecture</strong>, <strong>DDD</strong> e <strong>SOLID</strong> foram aplicados na prática para construir um sistema desacoplado, testável e robusto.
</p>
<p>
  Vamos explorar a estrutura em três níveis: o <strong>Modelo de Domínio</strong> (a estrutura dos dados), o <strong>Comportamento Dinâmico</strong> (como os objetos colaboram) e a <strong>Orquestração dos Módulos</strong> (como o NestJS conecta tudo).
</p>

<hr>

<h3>1. O Coração do Domínio: A Entidade <code>InspectionEntity</code></h3>
<p>
  Tudo começa com a nossa entidade principal, a <code>InspectionEntity</code>. Este diagrama de classe mostra a estrutura de dados central da aplicação e as suas relações diretas com as entidades de suporte (Lookups) e as entidades filhas (Checklist Items). É o mapa de dados fundamental do sistema.
</p>

```mermaid
classDiagram
    direction RL

    class LookupEntity {
        <<Abstract>>
        +id: number
        +name: string
    }

    class LookupStatusEntity { <<TypeORM Entity>> }
    class LookupModalityEntity { <<TypeORM Entity>> }
    class LookupOperationTypeEntity { <<TypeORM Entity>> }
    class LookupUnitTypeEntity { <<TypeORM Entity>> }
    class LookupContainerTypeEntity { <<TypeORM Entity>> }
    class LookupSealVerificationStatusEntity { <<TypeORM Entity>> }

    LookupStatusEntity --|> LookupEntity
    LookupModalityEntity --|> LookupEntity
    LookupOperationTypeEntity --|> LookupEntity
    LookupUnitTypeEntity --|> LookupEntity
    LookupContainerTypeEntity --|> LookupEntity
    LookupSealVerificationStatusEntity --|> LookupEntity

    class InspectionChecklistItemEntity {
        <<TypeORM Entity>>
        +id: number
        +observations: string
        +statusId: number
        +masterPointId: number
        + ...
    }

    class InspectionEntity {

        <<TypeORM Entity>>
        +id: number
        +inspectorName: string
        +statusId: number
        +entryRegistration: string
        +vehiclePlates: string
        +transportDocument: string
        +modalityId: number
        +operationTypeId: number
        +unitTypeId: number
        +containerTypeId: number
        +verifiedLength: number
        +verifiedWidth: number
        +verifiedHeight: number
        +startDatetime: Date
        +endDatetime: Date
        +driverName: string
        +driverSignaturePath: string
        +inspectorSignaturePath: string
        +sealUagaPostInspection: string
        +sealUagaPostLoading: string
        +sealShipper: string
        +sealRfb: string
        +sealVerificationRfbStatusId: number
        +sealVerificationShipperStatusId: number
        +sealVerificationTapeStatusId: number
        +sealVerificationResponsibleName: string
        +sealVerificationSignaturePath: string
        +sealVerificationDate: Date
        +observations: string
        +actionTaken: string
        +generatedPdfPath: string
        +createdAt: Date
        +updatedAt: Date
    }

    %% Relacionamentos (Associações)
    InspectionEntity "1" *-- "0..*" InspectionChecklistItemEntity : "possui (items)"

    InspectionEntity "*" o-- "1" LookupStatusEntity : "tem (status)"
    InspectionEntity "*" o-- "1" LookupModalityEntity : "tem (modality)"
    InspectionEntity "*" o-- "1" LookupOperationTypeEntity : "tem (operationType)"
    InspectionEntity "*" o-- "1" LookupUnitTypeEntity : "tem (unitType)"
    InspectionEntity "*" o-- "1" LookupContainerTypeEntity : "tem (containerType)"
   
    %% A mesma tabela de lookup pode ser referenciada múltiplas vezes
    InspectionEntity "*" o-- "1" LookupSealVerificationStatusEntity : "tem (sealVerificationRfbStatus)"
    InspectionEntity "*" o-- "1" LookupSealVerificationStatusEntity : "tem (sealVerificationShipperStatus)"
    InspectionEntity "*" o-- "1" LookupSealVerificationStatusEntity : "tem (sealVerificationTapeStatus)"
```

<h4>Como Ler Este Diagrama:</h4>
<ul>
<li><code><<Estereótipos>></code>: Indicam o "tipo" da classe. <code><<TypeORM Entity>></code> é uma classe mapeada para o banco, e <code><<Abstract>></code> é uma classe base.</li>
<li><code>*--</code> (Composição): A seta preenchida mostra que os <code>items</code> são "parte de" uma <code>InspectionEntity</code>. Se a inspeção for apagada, os seus itens também são.</li>
<li><code>o--</code> (Agregação): A seta vazia mostra que a <code>InspectionEntity</code> "tem uma" referência a uma entidade de Lookup, mas esta existe independentemente.</li>
</ul>

<hr>

<h3>2. Colaboração em Ação: O Fluxo de Finalização (Diagrama de Sequência)</h3>
<p>
Um diagrama de classes mostra a estrutura, mas um <strong>diagrama de sequência</strong> mostra a colaboração. Este diagrama detalha, passo a passo, como os diferentes componentes do sistema interagem ao longo do tempo para executar um dos nossos casos de uso mais críticos: a finalização de uma inspeção.
</p>

```mermaid
sequenceDiagram
    participant C as InspectionController
    participant UC as FinalizeInspectionUseCase
    participant Repo as IInspectionRepositoryPort
    participant Insp as Inspection (Model)
    
    C->>UC: execute(inspectionId)
    activate UC
    UC->>Repo: findById(inspectionId)
    activate Repo
    Repo-->>UC: inspection
    deactivate Repo
    
    UC->>Insp: isReadyToFinalize()
    activate Insp
    Insp-->>UC: true
    deactivate Insp
    
    UC->>Insp: calculateFinalStatus()
    activate Insp
    Insp-->>UC: APROVADO
    deactivate Insp
    
    UC->>Insp: finalize()
    activate Insp
    Insp-->>UC: 
    deactivate Insp
    
    UC->>Repo: save(inspection)
    activate Repo
    Repo-->>UC: inspectionFinalizada
    deactivate Repo
    
    UC-->>C: inspectionFinalizada
    deactivate UC
```

<h4>Como Ler Este Diagrama:</h4>
<ul>
<li><strong>Atores:</strong> Cada coluna representa um objeto ou classe.</li>
<li><strong>Linha do Tempo:</strong> A leitura é feita de cima para baixo.</li>
<li><strong>Setas:</strong> Indicam chamadas de métodos. As setas a tracejado indicam o retorno.</li>
<li><strong>O Padrão de Arquitetura em Ação:</strong> Note como o <code>Controller</code> apenas chama o <code>UseCase</code>. O <code>UseCase</code> orquestra tudo: ele busca o modelo de domínio (Inspection) através da porta do <code>Repository</code>, executa a lógica de negócio no próprio modelo e, finalmente, pede ao <code>Repository</code> para persistir o resultado.</li>
</ul>

<hr>

<h3>3. A Orquestração: Como o NestJS Conecta Tudo (Diagramas de Módulo)</h3>
<p>
Finalmente, os diagramas de módulo mostram como o NestJS, através de seu poderoso sistema de <strong>Injeção de Dependência</strong>, "conecta" todas as peças. Eles são a planta baixa da configuração do nosso contêiner de DI, demonstrando a aplicação prática do <strong>Princípio da Inversão de Dependência (SOLID)</strong>.
</p>

<h4>3.1 - O Módulo Principal: <code>InspectionModule</code></h4>

```mermaid
classDiagram
    direction TD
    class InspectionModule {
        <<NestJS Module>>
    }
    class InspectionController { <<ApiLayer>> }
    class ICreateInspectionUseCase { <<Interface>> DomainLayer }
    class CreateInspectionUseCaseImpl { DomainLayer }
    class IInspectionRepositoryPort { <<Interface>> DomainLayer }
    class InspectionRepository { <<Adapter>> InfraLayer }
    
    InspectionModule --* InspectionController : registra
    InspectionController --o ICreateInspectionUseCase : injeta ↘
    CreateInspectionUseCaseImpl --o IInspectionRepositoryPort : injeta ↘
    CreateInspectionUseCaseImpl ..|> ICreateInspectionUseCase : implementa
    InspectionRepository ..|> IInspectionRepositoryPort : implementa
```

<h4>3.2 - O Módulo de Suporte: <code>LookupModule</code></h4>

```mermaid
classDiagram
    direction LR
    class LookupModule { <<NestJS Module>> }
    class LookupController { <<ApiLayer>> }
    class IFindLookupsByTypeUseCase { <<Interface>> DomainLayer }
    class FindLookupsByTypeUseCaseImpl { DomainLayer }
    class ILookupRepositoryPort { <<Interface>> DomainLayer }
    class LookupRepository { <<Adapter>> InfraLayer }

    LookupModule --* LookupController : registra
    LookupController --o IFindLookupsByTypeUseCase : injeta ↘
    FindLookupsByTypeUseCaseImpl --o ILookupRepositoryPort : injeta ↘
    FindLookupsByTypeUseCaseImpl ..|> IFindLookupsByTypeUseCase : implementa
    LookupRepository ..|> ILookupRepositoryPort : implementa
```

<h4>Como Ler Estes Diagramas:</h4>
<ul>
<li><strong>Injeção de Dependência (--o):</strong> A seta com círculo vazio mostra a injeção. O ponto mais importante é que os componentes sempre dependem de <strong>abstrações</strong> (<code><<Interface>></code>), nunca de classes concretas de outras camadas. O <code>Controller</code> não "sabe" que <code>CreateInspectionUseCaseImpl</code> existe; ele apenas pede por <code>ICreateInspectionUseCase</code>.</li>
<li><strong>Implementação (..|&gt;):</strong> A seta pontilhada mostra qual classe concreta implementa uma interface. É no <code>providers</code> do Módulo que esta "ligação" é feita.</li>
</ul>
</details>
