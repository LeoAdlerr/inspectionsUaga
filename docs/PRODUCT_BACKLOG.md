<h1 id="product-backlog">🎯 Product Backlog</h1>
<p>
    Este documento é a fonte única da verdade para todos os requisitos, funcionalidades e melhorias do projeto. Ele
    serve para garantir que o trabalho de desenvolvimento esteja sempre alinhado com as necessidades de negócio.
</p>

<hr>

<h2 id="status-sprints">Status Atual e Navegação entre Sprints</h2>
<ul>
    <li>
        <p>
            <strong>Sprint 1 (Concluída em 08 de Agosto de 2025):</strong> Entregamos a Prova de Conceito (PoC),
            validando a arquitetura e as funcionalidades core iniciais do produto.
            <br>
            ➡️ <strong><a href="./sprints/SPRINT_1.md">Ver Retrospectiva e Entregas da Sprint 1</a></strong>
        </p>
    </li>
    <li>
        <p>
            <strong>Sprint 2 (Pronta para Iniciar):</strong> Após um profundo refinamento com a operação e a equipe
            técnica, o plano da Sprint 2 foi consolidado. O desenvolvimento inicia em <strong>18 de Agosto de
                2025</strong> com uma nova cadência de <strong>2 semanas</strong>.
            <br>
            ➡️ <strong><a href="./sprints/SPRINT_2.md">Ver Planejamento Detalhado da Sprint 2</a></strong>
        </p>
    </li>
</ul>
<hr>

<h2 id="requisitos-de-negocio">📋 Requisitos de Negócio</h2>
<p>
    Abaixo estão listados todos os requisitos de negócio levantados, classificados como <strong>Funcionais (RF)</strong>
    e <strong>Não-Funcionais (RNF)</strong>.
</p>

<h3>Requisitos Funcionais (RF)</h3>
<h4>Planejados</h4>
<ul>
    <li><strong>(RF-01)</strong> Navegação Guiada no Checklist</li>
    <li><strong>(RF-03)</strong> Assinaturas Digitais</li>
    <li><strong>(RF-04) (Atualizado)</strong> Checklist Dinâmico (11 pontos para Marítimo, 18 para Rodoviário/Aéreo).
    </li>
    <li><strong>(RF-05) (Atualizado)</strong> Relatórios Aprimorados (incluindo evidências de lacração).</li>
    <li><strong>(RF-06)</strong> Limite de Uma Foto por Item de Checklist.</li>
    <li><strong>(RF-15)</strong> Validação Condicional de Campos.</li>
    <li><strong>(RF-16)</strong> Relatórios Configuráveis (Ocultar N/A).</li>
    <li><strong>(RF-17)</strong> Registro de Métodos de Verificação (Sub-itens).</li>
    <li><strong>(RF-18)</strong> Preenchimento Automático de Dimensões Padrão.</li>
    <li><strong>(RF-19)</strong> Módulo de Lacres - Etapa 1: Lacração Pós-Inspeção.</li>
    <li><strong>(RF-20)</strong> Módulo de Lacres - Etapa 2: Carregamento.</li>
    <li><strong>(RF-21)</strong> Módulo de Lacres - Etapa 3: Liberação para Fiscalização.</li>
    <li><strong>(RF-22)</strong> Módulo de Lacres - Etapa 4: Verificação de Saída.</li>
    <li><strong>(RF-23)</strong> Ciclo de Vida e Imutabilidade dos Dados.</li>
    <li><strong>(RF-24)</strong> Fluxo de Trabalho por Etapas e Papéis.</li>
    <li><strong>(RF-25)</strong> Verificação de Precinto Pré-Saída.</li>
</ul>

<h3>Requisitos Não-Funcionais (RNF)</h3>
<h4>Planejados</h4>
<ul>
    <li><strong>(RNF-02) (Atualizado)</strong> Segurança e Permissões (RBAC): O sistema deve implementar autenticação e
        um sistema de controle de acesso baseado em papéis (Role-Based Access Control) para 5 perfis distintos:
        <strong>Admin, Documental, Inspetor, Conferente e Portaria</strong>.
    </li>
    <li><strong>(RNF-07)</strong> Armazenamento: Garantir que os relatórios e evidências sejam salvos de forma
        organizada e persistente no servidor.</li>
    <li><strong>(RNF-26) (NOVO)</strong> Qualidade e Integração Contínua (CI): A esteira de CI deve garantir a
        estabilidade do código.
        <ul>
            <li>O CI de cada sub-repositório (frontend, backend) deve rodar os testes em um ambiente de desenvolvimento
                simulado.</li>
            <li>O CI/CD do repositório principal deve orquestrar todos os serviços juntos, executando testes de
                integração em um ambiente buildado e otimizado para produção.</li>
        </ul>
    </li>
    <li><strong>(RNF-27) (NOVO)</strong> Implantação e Manutenibilidade (CD): O processo de deploy e a configuração do
        ambiente de produção devem ser robustos e de fácil manutenção.
        <ul>
            <li>O ambiente de homologação/produção (IIS) deve garantir que as aplicações (frontend e backend) reiniciem
                automaticamente em caso de falha ou reboot do servidor.</li>
            <li>O processo de atualização da aplicação em produção deve ser simplificado para um comando
                <code>git pull</code>, alinhado à estratégia de Trunk-Based Development.
            </li>
        </ul>
    </li>
</ul>

<hr>

<h2 id="user-stories">📑 Histórias de Usuário (User Stories) - Backlog Completo</h2>
<p>
    A tabela a seguir é o Product Backlog completo, contendo o trabalho já entregue (Sprint 1) e o backlog de futuras
    histórias, refinadas e estimadas pela equipe.
</p>
<table border="1" cellpadding="10" cellspacing="0" width="100%">
    <thead>
        <tr bgcolor="#f2f2f2">
            <th align="left" style="width: 15%;"><b>Épico</b></th>
            <th align="left" style="width: 5%;"><b>ID</b></th>
            <th align="left" style="width: 40%;"><b>História de Usuário</b></th>
            <th align="center" style="width: 15%;"><b>Requisito(s) Atendido(s)</b></th>
            <th align="center" style="width: 10%;"><b>Pontos (SP)</b></th>
            <th align="center" style="width: 15%;"><b>Status</b></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td valign="top" rowspan="3">Gestão de Inspeções (Core)</td>
            <td><strong>US-01</strong></td>
            <td><strong>Como um</strong> inspetor, <strong>eu quero</strong> iniciar um novo checklist...</td>
            <td align="center">RF-08</td>
            <td align="center">N/A</td>
            <td valign="top" bgcolor="#e8f5e9">✅ Entregue</td>
        </tr>
        <tr>
            <td><strong>US-02</strong></td>
            <td><strong>Como um</strong> inspetor, <strong>eu quero</strong> avaliar cada um dos 18 pontos...</td>
            <td align="center">RF-09, 10, 11</td>
            <td align="center">N/A</td>
            <td valign="top" bgcolor="#e8f5e9">✅ Entregue</td>
        </tr>
        <tr>
            <td><strong>US-03</strong></td>
            <td><strong>Como um</strong> inspetor, <strong>eu quero</strong> finalizar o checklist...</td>
            <td align="center">RF-14</td>
            <td align="center">N/A</td>
            <td valign="top" bgcolor="#e8f5e9">✅ Entregue</td>
        </tr>
        <tr>
            <td valign="top" rowspan="2">Relatórios e Análise</td>
            <td><strong>US-05</strong></td>
            <td><strong>Como um</strong> inspetor, <strong>eu quero</strong> que um relatório em PDF seja gerado...</td>
            <td align="center">RF-12</td>
            <td align="center">N/A</td>
            <td valign="top" bgcolor="#e8f5e9">✅ Entregue</td>
        </tr>
        <tr>
            <td><strong>US-06</strong></td>
            <td><strong>Como um</strong> inspetor, <strong>eu quero</strong> acessar um dashboard com a listagem...</td>
            <td align="center">RF-13</td>
            <td align="center">N/A</td>
            <td valign="top" bgcolor="#e8f5e9">✅ Entregue</td>
        </tr>
        <tr>
            <td valign="top" rowspan="4">Gestão de Acesso e Perfis</td>
            <td><strong>US-04</strong></td>
            <td><strong>Como um</strong> usuário, <strong>eu quero</strong> me autenticar com email e senha.</td>
            <td align="center">RNF-02</td>
            <td align="center">8</td>
            <td valign="top" bgcolor="#fffde7">Sprint 2</td>
        </tr>
        <tr>
            <td><strong>US-30</strong></td>
            <td><strong>Como um</strong> sistema, <strong>eu quero</strong> que o token de autenticação contenha a role
                do usuário.</td>
            <td align="center">RNF-02</td>
            <td align="center">5</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-08</strong></td>
            <td><strong>Como um</strong> usuário, <strong>eu quero</strong> visualizar um dashboard com a minha fila de
                trabalho.</td>
            <td align="center">RF-24</td>
            <td align="center">8</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-09</strong></td>
            <td><strong>Como um</strong> Admin, <strong>eu quero</strong> uma interface para gerenciar usuários e seus
                papéis.</td>
            <td align="center">RNF-02</td>
            <td align="center">8</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td valign="top" rowspan="6">Fluxo de Inspeção</td>
            <td><strong>US-17</strong></td>
            <td><strong>Como um</strong> Documental, <strong>eu quero</strong> criar uma nova inspeção com os dados
                iniciais.</td>
            <td align="center">RF-24</td>
            <td align="center">3</td>
            <td valign="top" bgcolor="#fffde7">Sprint 2</td>
        </tr>
        <tr>
            <td><strong>US-18</strong></td>
            <td><strong>Como um</strong> sistema, <strong>eu quero</strong> preencher as dimensões padrão do contêiner.
            </td>
            <td align="center">RF-18</td>
            <td align="center">2</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-19</strong></td>
            <td><strong>Como um</strong> Inspetor, <strong>eu quero</strong> ver um checklist dinâmico (11 ou 18
                pontos).</td>
            <td align="center">RF-04</td>
            <td align="center">5</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-20</strong></td>
            <td><strong>Como um</strong> Inspetor, <strong>eu quero</strong> registrar status e uma única foto por item.
            </td>
            <td align="center">RF-06</td>
            <td align="center">5</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-21</strong></td>
            <td><strong>Como um</strong> Inspetor, <strong>eu quero</strong> selecionar os métodos de verificação
                (sub-itens).</td>
            <td align="center">RF-17</td>
            <td align="center">8</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-22</strong></td>
            <td><strong>Como um</strong> sistema, <strong>eu quero</strong> aplicar as regras de validação condicional.
            </td>
            <td align="center">RF-15</td>
            <td align="center">3</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td valign="top" rowspan="7">Módulo de Lacres</td>
            <td><strong>US-23</strong></td>
            <td><strong>Como um</strong> Documental/Admin, <strong>eu quero</strong> validar um checklist preenchido.
            </td>
            <td align="center">RF-24</td>
            <td align="center">5</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-24</strong></td>
            <td><strong>Como um</strong> Inspetor, <strong>eu quero</strong> registrar a lacração pós-inspeção com
                assinatura.</td>
            <td align="center">RF-19, RF-03</td>
            <td align="center">8</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-31</strong></td>
            <td><strong>Como um</strong> Inspetor, <strong>eu quero</strong> anexar as evidências da lacração.</td>
            <td align="center">RF-19</td>
            <td align="center">5</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-25</strong></td>
            <td><strong>Como um</strong> Conferente, <strong>eu quero</strong> registrar o processo de carregamento e
                assinaturas.</td>
            <td align="center">RF-20, RF-03</td>
            <td align="center">8</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-32</strong></td>
            <td><strong>Como um</strong> Conferente, <strong>eu quero</strong> anexar as evidências do relacre
                pós-carregamento.</td>
            <td align="center">RF-20</td>
            <td align="center">5</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-26</strong></td>
            <td><strong>Como um</strong> Conferente, <strong>eu quero</strong> realizar a verificação de precinto
                pré-saída.</td>
            <td align="center">RF-25</td>
            <td align="center">8</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-27</strong></td>
            <td><strong>Como uma</strong> Portaria, <strong>eu quero</strong> uma interface para verificação final dos
                lacres.</td>
            <td align="center">RF-22</td>
            <td align="center">5</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td valign="top" rowspan="3">Relatórios e Análise</td>
            <td><strong>US-11</strong></td>
            <td><strong>Como um</strong> usuário, <strong>eu quero</strong> gerar um relatório principal dinâmico e
                assinado.</td>
            <td align="center">RF-05</td>
            <td align="center">8</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-15</strong></td>
            <td><strong>Como um</strong> usuário, <strong>eu quero</strong> gerar um relatório fotográfico com
                evidências de lacração.</td>
            <td align="center">RF-05</td>
            <td align="center">5</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-16</strong></td>
            <td><strong>Como um</strong> usuário, <strong>eu quero</strong> a opção de ocultar itens "N/A" ao gerar um
                relatório.</td>
            <td align="center">RF-16</td>
            <td align="center">2</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td valign="top" rowspan="4">Infraestrutura e DevOps</td>
            <td><strong>US-28</strong></td>
            <td><strong>Como</strong> Dev, <strong>eu quero</strong> ambientes docker-compose para testes unitários.
            </td>
            <td align="center">RNF-26</td>
            <td align="center">5</td>
            <td valign="top" bgcolor="#fffde7">Sprint 2</td>
        </tr>
        <tr>
            <td><strong>US-33</strong></td>
            <td><strong>Como</strong> Dev, <strong>eu quero</strong> um ambiente de integração que simule a produção.
            </td>
            <td align="center">RNF-26</td>
            <td align="center">5</td>
            <td valign="top" bgcolor="#fffde7">Sprint 2</td>
        </tr>
        <tr>
            <td><strong>US-34</strong></td>
            <td><strong>Como</strong> Equipe, <strong>eu quero</strong> um comando para executar os testes E2E.</td>
            <td align="center">RNF-26</td>
            <td align="center">3</td>
            <td valign="top" bgcolor="#fffde7">Sprint 2</td>
        </tr>
        <tr>
            <td><strong>US-29</strong></td>
            <td><strong>Como</strong> Equipe, <strong>eu quero</strong> a aplicação implantada em homologação.</td>
            <td align="center">RNF-27</td>
            <td align="center">8</td>
            <td valign="top" bgcolor="#fffde7">Sprint 2</td>
        </tr>
        <tr>
            <td valign="top" rowspan="2">Qualidade Técnica</td>
            <td><strong>TASK-FIX-BE</strong></td>
            <td><strong>[Fix]</strong> Estabilizar suíte de testes do Backend</td>
            <td align="center">RNF-26</td>
            <td align="center">2</td>
            <td valign="top" bgcolor="#fffde7">Sprint 2</td>
        </tr>
        <tr>
            <td><strong>TASK-FIX-FE</strong></td>
            <td><strong>[Fix]</strong> Estabilizar suíte de testes do Frontend</td>
            <td align="center">RNF-26</td>
            <td align="center">3</td>
            <td valign="top" bgcolor="#fffde7">Sprint 2</td>
        </tr>
        <tr>
            <td valign="top" rowspan="2">Melhorias de Usabilidade</td>
            <td><strong>US-07</strong></td>
            <td><strong>Como um</strong> inspetor, <strong>eu quero</strong> ser guiado para o próximo item do
                checklist.</td>
            <td align="center">RF-01</td>
            <td align="center">3</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
        <tr>
            <td><strong>US-12</strong></td>
            <td><strong>Como um</strong> usuário, <strong>eu quero</strong> salvar e gerenciar uma assinatura no meu
                perfil.</td>
            <td align="center">RF-03</td>
            <td align="center">5</td>
            <td valign="top" bgcolor="#eeeeee">Backlog</td>
        </tr>
    </tbody>
</table>
