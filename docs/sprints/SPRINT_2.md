<h1 id="sprint-2">Sprint 2: Estabilizar e Construir a Base (Replanejado)</h1>

<h2 id="contexto-e-meta-da-sprint">Contexto e Meta da Sprint</h2>
<p>
    Após o início dos trabalhos, foram identificados débitos técnicos na base de testes. Em alinhamento com o PO e o SM, a sprint foi repriorizada para focar na resolução destes débitos e na conclusão do alicerce técnico. A meta permanece a mesma: entregar uma plataforma de desenvolvimento e segurança robusta.
</p>
<p>
    <strong>Meta da Sprint (Sprint Goal):</strong> Estabilizar 100% a base de código e os testes, e construir e implantar o alicerce técnico (CI/CD, Deploy) e de segurança (Autenticação) em um ambiente de homologação funcional.
</p>

<hr>

<h2 id="sprint-backlog">Sprint Backlog (Escopo de 40 Story Points)</h2>
<p>
    O escopo foi ajustado para refletir as novas prioridades, totalizando <strong>40 Story Points</strong>. A <strong>US-17</strong> foi movida para a Sprint 3 para dar lugar às tarefas críticas de estabilização.
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
            <td><strong>TASK-FIX-FE</strong></td>
            <td><strong>[Fix]</strong> Estabilizar suíte de testes do Frontend</td>
            <td>Débito Técnico</td>
            <td align="center">3</td>
        </tr>
        <tr>
            <td><strong>TASK-FIX-BE</strong></td>
            <td><strong>[Fix]</strong> Estabilizar suíte de testes do Backend</td>
            <td>Débito Técnico</td>
            <td align="center">2</td>
        </tr>
        <tr>
            <td><strong>US-29</strong></td>
            <td><strong>Como</strong> Equipe, <strong>eu quero</strong> a aplicação implantada em homologação.</td>
            <td>Infraestrutura e DevOps</td>
            <td align="center">8</td>
        </tr>
        <tr>
            <td><strong>US-04</strong></td>
            <td><strong>Como um</strong> usuário, <strong>eu quero</strong> me autenticar com email e senha.</td>
            <td>Gestão de Acesso e Perfis</td>
            <td align="center">8</td>
        </tr>
        <tr>
            <td><strong>US-28</strong></td>
            <td><strong>Como</strong> Dev, <strong>eu quero</strong> ambientes docker-compose para testes unitários.</td>
            <td>Infraestrutura e DevOps</td>
            <td align="center">8</td>
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
        <tr bgcolor="#f2f2f2">
            <td colspan="3" align="right"><b>Total do Compromisso:</b></td>
            <td align="center"><b>40</b></td>
        </tr>
    </tbody>
</table>

<hr>

<h2 id="plano-de-execucao">Plano de Execução e Status Atual</h2>

<h4><strong>Semana 1 (18/Ago - 22/Ago): Foco em Estabilização e Fundação do Deploy</strong></h4>
<ul>
    <li><strong>Status:</strong> Concluída</li>
    <li><strong>Pontos Entregues:</strong> 16 SP</li>
    <li><strong>Tasks Concluídas:</strong> TASK-78 (Refactor), TASK-69, TASK-70 (Ambientes de Teste Unitário), TASK-60, TASK-61, TASK-62 (Setup IIS e Deploy), TASK-63 (Smoke Test), TASK-71 (Orquestração BE).</li>
</ul>

<h4><strong>Semana 2 (25/Ago - 29/Ago): Foco em Finalizar a Infraestrutura e Acesso</strong></h4>
<ul>
    <li><strong>Status:</strong> Em Andamento</li>
    <li><strong>Pontos Restantes:</strong> 24 SP</li>
    <li><strong>Foco Principal:</strong>
        <ol>
            <li>Finalizar a esteira de CI/CD (<strong>US-33</strong> e <strong>US-34</strong>).</li>
            <li>Resolver os débitos técnicos dos testes (<strong>TASK-FIX-FE</strong> e <strong>TASK-FIX-BE</strong>).</li>
            <li>Implementar a funcionalidade de autenticação (<strong>US-04</strong>).</li>
        </ol>
    </li>
</ul>


<details>
    <summary><strong>Tasks da Sprint 2 em detalhe (Total: 37 SP):</strong></summary>
    <br>
    <table border="1" cellpadding="8" cellspacing="0" width="100%">
        <thead>
            <tr bgcolor="#f2f2f2">
                <th align="left" style="width: 15%;"><b>US/Item Pai</b></th>
                <th align="left" style="width: 5%;"><b>ID da Task</b></th>
                <th align="left" style="width: 60%;"><b>Título da Task</b></th>
                <th align="center" style="width: 10%;"><b>Pontos (SP)</b></th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td valign="top"><strong>TASK-FIX-BE</strong> (2 SP)</td>
                <td>TASK-79</td><td><code>[Fix]</code> Corrigir Testes Unitários Falhando no Backend</td><td align="center">2</td>
            </tr>
            <tr>
                <td valign="top"><strong>TASK-FIX-FE</strong> (3 SP)</td>
                <td>TASK-80</td><td><code>[Fix]</code> Corrigir Testes Unitários Falhando no Frontend</td><td align="center">3</td>
            </tr>
            <tr>
                <td valign="top" rowspan="3"><strong>US-28</strong> (8 SP)</td>
                <td>TASK-78</td><td><code>[Refactor]</code> Corrigir tipagem 'any' no Frontend</td><td align="center">3</td>
            </tr>
            <tr>
                <td>TASK-69</td><td><code>[DevOps]</code> Configurar Ambiente de Testes Unitários do Backend</td><td align="center">3</td>
            </tr>
            <tr>
                <td>TASK-70</td><td><code>[DevOps]</code> Configurar Ambiente de Testes Unitários do Frontend</td><td align="center">2</td>
            </tr>
            <tr>
                <td valign="top" rowspan="3"><strong>US-33</strong> (5 SP)</td>
                <td>TASK-71</td><td><code>[DevOps]</code> Orquestrar o Backend em Modo de Produção</td><td align="center">1</td>
            </tr>
            <tr>
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
                <td valign="top" rowspan="4"><strong>US-29</strong> (8 SP)</td>
                <td>TASK-60</td><td><code>[Deploy]</code> Configuração do IIS para o Backend</td><td align="center">3</td>
            </tr>
            <tr>
                <td>TASK-61</td><td><code>[Deploy]</code> Configuração do IIS para o Frontend</td><td align="center">2</td>
            </tr>
            <tr>
                <td>TASK-62</td><td><code>[Deploy]</code> Implementação do Fluxo de Atualização via Git</td><td align="center">2</td>
            </tr>
            <tr>
                <td>TASK-63</td><td><code>[QA]</code> Validação e Teste de Fumaça do Ambiente</td><td align="center">1</td>
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
        </tbody>
        <tfoot>
            <tr bgcolor="#f2f2f2">
                <td align="right" colspan="3"><strong>Total de Tarefas / Pontos da Sprint:</strong></td>
                <td align="center"><strong>19 / 37</strong></td>
            </tr>
        </tfoot>
    </table>
</details>

<h2 id="analise-do-tech-lead">Análise do Tech Lead</h2>
<p>
    Com este novo plano, a nossa situação é a seguinte:
</p>
<ul>
    <li>✅ Entregamos <strong>16 pontos</strong> na primeira semana - um ritmo excelente que mostra alta produtividade na resolução de problemas de infraestrutura.</li>
    <li>⚠️ Restam <strong>24 pontos</strong> para a segunda semana. Este é um objetivo <strong>muito ambicioso</strong> e representa um risco para a entrega de 100% do escopo. Precisamos de ser extremamente focados.</li>
    <li>🚀 **Recomendação Estratégica:** A prioridade máxima deve ser finalizar a "fábrica" (US-33 e US-34) e estabilizar a base (as tasks de Fix). A US-04 (Autenticação) deve ser trabalhada em paralelo, mas se o tempo ficar apertado, a entrega da infraestrutura 100% funcional tem prioridade sobre a feature.</li>
</ul>