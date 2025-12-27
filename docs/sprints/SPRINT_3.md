<h1 id="sprint-3">Sprint 3: A Finalização da Fábrica</h1>

<h2 id="contexto-e-meta-da-sprint">Contexto e Meta da Sprint</h2>
<p>
    Após uma Sprint 2 de profunda aprendizagem e estabilização, a Sprint 3, com duração de <strong>2 semanas</strong> (de <strong>01 de Setembro a 12 de Setembro de 2025</strong>), tem um objetivo claro e fundamental: completar o alicerce técnico do projeto.
</p>
<p>
    Esta sprint é o nosso "diabo necessário" final – um investimento focado em infraestrutura e segurança. Ao concluí-la, a nossa "fábrica" de desenvolvimento estará 100% operacional, com uma esteira de CI/CD robusta e automatizada. Isto irá desbloquear uma velocidade e segurança de desenvolvimento muito superiores para todas as sprints futuras, permitindo que a equipe foque exclusivamente na entrega de valor de negócio.
</p>
<p>
    <strong>Meta da Sprint (Sprint Goal):</strong> Finalizar 100% da esteira de DevOps e da base técnica, resolvendo todos os débitos pendentes para desbloquear a velocidade e a segurança do desenvolvimento futuro, e implementar a próxima camada do sistema de perfis de acesso (RBAC).
</p>

<hr>

<h2 id="sprint-backlog">Sprint Backlog (Escopo de 15 Story Points)</h2>
<p>
    Seguindo a nossa "Regra dos 50%", selecionamos um escopo focado e realista de <strong>15 pontos</strong> para garantir a entrega com qualidade e um ritmo sustentável.
</p>
<table border="1" cellpadding="10" cellspacing="0" width="100%">
    <thead>
        <tr bgcolor="#f2f2f2">
            <th align="left"><b>ID</b></th>
            <th align="left"><b>História / Tarefa</b></th>
            <th align="left"><b>Épico</b></th>
            <th align="center"><b>Pontos (SP)</b></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>TASK-FIX-BE</strong></td>
            <td><strong>[Fix]</strong> Estabilizar suíte de testes do Backend</td>
            <td>Qualidade Técnica</td>
            <td align="center">2</td>
        </tr>
        <tr>
            <td><strong>US-33</strong></td>
            <td><strong>Como</strong> Dev, <strong>eu quero</strong> um ambiente de integração que simule a produção.</td>
            <td>Infraestrutura e DevOps</td>
            <td align="center">5</td>
        </tr>
        <tr>
            <td><strong>US-34</strong></td>
            <td><strong>Como</strong> Equipe, <strong>eu quero</strong> um comando para executar os testes E2E.</td>
            <td>Infraestrutura e DevOps</td>
            <td align="center">3</td>
        </tr>
        <tr>
            <td><strong>US-30</strong></td>
            <td><strong>Como um</strong> sistema, <strong>eu quero</strong> que o token de autenticação contenha a role do usuário.</td>
            <td>Gestão de Acesso e Perfis</td>
            <td align="center">5</td>
        </tr>
        <tr bgcolor="#f2f2f2">
            <td colspan="3" align="right"><b>Total do Compromisso:</b></td>
            <td align="center"><b>15</b></td>
        </tr>
    </tbody>
</table>

<hr>

<h2 id="plano-de-execucao">Plano de Execução Sugerido</h2>
<ul>
    <li>
        <strong>Semana 1 (01/Set - 05/Set):</strong> Foco em pagar a dívida técnica e construir o ambiente de integração.
        <ul>
            <li><code>TASK-FIX-BE</code>: Prioridade máxima para garantir que todos os testes de backend estejam a passar.</li>
            <li><code>US-33</code>: Construir o ambiente de integração, a peça mais complexa de DevOps.</li>
        </ul>
    </li>
    <li>
        <strong>Semana 2 (08/Set - 12/Set):</strong> Foco em automatizar os testes E2E e avançar na segurança.
        <ul>
            <li><code>US-34</code>: Criar o comando unificado de testes E2E sobre o ambiente de integração.</li>
            <li><code>US-30</code>: Com a "fábrica" pronta, implementar a lógica de roles no token de autenticação.</li>
        </ul>
    </li>
</ul>

<hr>

<h2 id="detalhamento-us">Detalhamento das Histórias de Usuário e Tarefas</h2>

<h4><strong>TASK-FIX-BE: Estabilizar Suíte de Testes do Backend</strong></h4>
<ul>
    <li><strong>Descrição:</strong> Tarefa para corrigir a suíte de testes unitários do backend, que foi impactada por refactors e mudanças anteriores, garantindo que o CI do backend seja confiável.</li>
    <li><strong>Requisito(s) Atendido(s):</strong> RNF-26</li>
    <li><strong>Critérios de Aceite:</strong>
        <ol>
            <li>Todos os testes unitários falhando no backend devem ser identificados.</li>
            <li>Os testes devem ser corrigidos para se alinharem com o estado atual do código.</li>
            <li>O comando de testes do backend (<code>npm run test:ci</code>) deve ser executado com 100% de sucesso no ambiente Docker.</li>
        </ol>
    </li>
</ul>

<h4><strong>US-33: Ambiente de Integração</strong></h4>
<ul>
    <li><strong>História:</strong> <strong>Como</strong> Desenvolvedor, <strong>eu quero</strong> um ambiente de integração no CI/CD principal que orquestre todos os serviços juntos, <strong>para que</strong> possamos executar testes de integração e E2E que validem o sistema como um todo.</li>
    <li><strong>Requisito(s) Atendido(s):</strong> RNF-26</li>
    <li><strong>Critérios de Aceite:</strong>
        <ol>
            <li>Um ficheiro <code>docker-compose.integration.yml</code> deve existir no repositório principal.</li>
            <li>Este ficheiro deve orquestrar as builds de produção do frontend e do backend.</li>
            <li>Deve incluir um serviço de proxy reverso (Nginx) para simular o roteamento de produção.</li>
            <li>O ambiente completo deve ser inicializado e derrubado com um único comando.</li>
        </ol>
    </li>
</ul>

<h4><strong>US-34: Comando para Execução de Testes E2E</strong></h4>
<ul>
    <li><strong>História:</strong> <strong>Como</strong> Equipe, <strong>eu quero</strong> um comando único e simples no CI/CD principal, <strong>para que</strong> possamos facilmente disparar a suíte de testes End-to-End no ambiente de integração.</li>
    <li><strong>Requisito(s) Atendido(s):</strong> RNF-26</li>
    <li><strong>Critérios de Aceite:</strong>
        <ol>
            <li>Um script (ex: <code>npm run test:e2e</code>) deve ser criado no <code>package.json</code> da raiz do projeto.</li>
            <li>O script deve orquestrar a sequência: subir o ambiente de integração (de <code>US-33</code>), executar a suíte de testes E2E (Cypress) e derrubar o ambiente no final, mesmo em caso de falha nos testes.</li>
            <li>O comando deve terminar com um código de saída de sucesso (0) apenas se todos os testes E2E passarem.</li>
        </ol>
    </li>
</ul>

<h4><strong>US-30: Token de Autenticação com Role</strong></h4>
<ul>
    <li><strong>História:</strong> <strong>Como um</strong> sistema, <strong>eu quero</strong> que o token de autenticação contenha a role (perfil) do usuário, <strong>para que</strong> as futuras camadas de autorização possam tomar decisões com base no perfil do usuário logado.</li>
    <li><strong>Requisito(s) Atendido(s):</strong> RNF-02</li>
    <li><strong>Critérios de Aceite:</strong>
        <ol>
            <li>A entidade/tabela de `User` no banco de dados deve ser atualizada para incluir um campo `role`.</li>
            <li>A carga útil (payload) do token JWT gerado no login (<code>US-04</code>) deve agora incluir o campo `role`.</li>
            <li>O Guard de autenticação no backend deve ser capaz de extrair o `role` do token e anexá-lo ao objeto da requisição.</li>
            <li>Os testes E2E de login devem ser atualizados para validar a presença do `role` no token.</li>
        </ol>
    </li>
</ul>

<hr>

<table border="1" cellpadding="8" cellspacing="0" width="100%">
<thead>
<tr bgcolor="#f2f2f2">
<th align="left"><b>US/Item Pai</b></th>
<th align="left"><b>ID da Task</b></th>
<th align="left"><b>Título da Task</b></th>
<th align="center"><b>Pontos (SP)</b></th>
</tr>
</thead>
<tbody>
<tr>
<td valign="top"><strong>TASK-FIX-BE</strong> (2 SP)</td>
<td>TASK-80</td><td><code>[Fix]</code> Estabilizar a Suíte de Testes do Backend</td><td align="center">2</td>
</tr>
<tr>
<td valign="top" rowspan="2"><strong>US-33</strong> (4 SP)</td>
<td>TASK-72</td><td><code>[DevOps]</code> Criar Imagem de Produção do Frontend com Nginx</td><td align="center">2</td>
</tr>
<tr>
<td>TASK-73</td><td><code>[DevOps]</code> Integrar e Configurar a Rede dos Serviços</td><td align="center">2</td>
</tr>
<tr>
<td valign="top" rowspan="2"><strong>US-34</strong> (3 SP)</td>
<td>TASK-74</td><td><code>[DevOps]</code> Criar Serviço Docker-Compose para o Cypress Runner</td><td align="center">2</td>
</tr>
<tr>
<td>TASK-75</td><td><code>[DevOps]</code> Criar o Script de Orquestração dos Testes E2E</td><td align="center">1</td>
</tr>
<tr>
<td valign="top" rowspan="5"><strong>US-04</strong> (8 SP)</td>
<td>TASK-64</td><td><code>[BD]</code> Criar Tabela 'users'</td><td align="center">1</td>
</tr>
<tr>
<td>TASK-65</td><td><code>[BE]</code> Implementar Lógica de Autenticação</td><td align="center">3</td>
</tr>
<tr>
<td>TASK-66</td><td><code>[BE]</code> Configurar Camada de API (Controller/Guard)</td><td align="center">1</td>
</tr>
<tr>
<td>TASK-67</td><td><code>[FE]</code> Desenvolver Página de Login e Store Pinia</td><td align="center">2</td>
</tr>
<tr>
<td>TASK-68</td><td><code>[FE/Test]</code> Implementar Proteção de Rotas e Teste E2E</td><td align="center">1</td>
</tr>
<tr>
<td valign="top" rowspan="4"><strong>US-30</strong> (5 SP)</td>
<td>TASK-81</td><td><code>[BD]</code> Atualizar Schema do Usuário com Campo 'role'</td><td align="center">1</td>
</tr>
<tr>
<td>TASK-82</td><td><code>[BE]</code> Incluir 'role' no Payload do Token JWT</td><td align="center">2</td>
</tr>
<tr>
<td>TASK-83</td><td><code>[BE]</code> Extrair 'role' do Token e Anexar à Requisição</td><td align="center">1</td>
</tr>
<tr>
<td>TASK-84</td><td><code>[Test]</code> Atualizar Testes E2E para Validar 'role' no Token</td><td align="center">1</td>
</tr>
</tbody>
<tfoot>
<tr bgcolor="#f2f2f2">
<td align="right" colspan="3"><strong>Total de Tarefas / Pontos da Sprint 3:</strong></td>
<td align="center"><strong>14 / 22</strong></td>
</tr>
</tfoot>
</table>
<h2 id="acompanhamento">Acompanhamento da Sprint</h2>
<p>
    Esta seção será atualizada com o gráfico Burndown ao final da sprint para visualizarmos o progresso do trabalho realizado.
</p>
