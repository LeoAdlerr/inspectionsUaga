<div align="center">
    <h1>📋 Backlog do Produto: Plataforma de Inspeção 8/18</h1>
    <p><strong>Documento Base:</strong> Plano de Entregas (Rev. 19/11/2025)</p>
    <p><strong>Responsável Técnico:</strong> Leonardo Adler da Silva</p>
    <p><strong>Meta Final:</strong> Go-Live V1.0 em 30 de Dezembro de 2025.</p>
</div>
<hr>

<h2 id="cronograma-sprints">1. Estratégia de Releases (Novo Cronograma)</h2>
<p>O desenvolvimento foi reestruturado em 3 ciclos para validar etapas críticas antes do Go-Live.</p>
<table border="1">
    <thead>
        <tr>
            <th width="20%">Release / Sprint</th>
            <th width="15%">Deadline</th>
            <th width="40%">Escopo da Entrega</th>
            <th width="25%">Valor para o Negócio</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Release 1<br>(Fluxo Interno)</strong></td>
            <td><strong>05/Dez</strong></td>
            <td>
                <strong>Conexão de Departamentos</strong><br>
                Máquina de Estados, Documental, Lacração Inicial e Operação de Conferência (Pátio).
            </td>
            <td>
                <div class="milestone">
                    ✅ <strong>Fim do "Silo"</strong><br>
                    O sistema integra Inspetor, Documental e Conferente.
                </div>
            </td>
        </tr>
        <tr>
            <td><strong>Release 2<br>(Compliance & UX)</strong></td>
            <td><strong>19/Dez</strong></td>
            <td>
                <strong>Segurança e Usabilidade</strong><br>
                Validação de Precinto, Checklist de Saída (Portaria), Gabarito Visual e Otimização de Dados.
            </td>
            <td>
                <div class="milestone">
                    ✅ <strong>Segurança Crítica</strong><br>
                    Garante que a carga está selada e validada para viagem.
                </div>
            </td>
        </tr>
        <tr>
            <td><strong>Release 3<br>(Go-Live)</strong></td>
            <td><strong>30/Dez</strong></td>
            <td>
                <strong>Finalização e Saída</strong><br>
                Controle de Portaria (Gate Out), Relatório PDF Final e Deploy em Produção.
            </td>
            <td>
                <div class="milestone">
                    🚀 <strong>Sistema Operacional</strong><br>
                    Controle físico de saída e documentação legal automática.
                </div>
            </td>
        </tr>
    </tbody>
</table>

<hr>

<h2 id="sprint-backlog">2. Tabela de Backlog de Desenvolvimento (Por Release)</h2>
<table border="1">
    <thead>
        <tr>
            <th width="10%">Release</th>
            <th width="10%">ID</th>
            <th width="45%">Item (User Story / Task)</th>
            <th width="15%">Dependências</th>
            <th width="5%">Pontos</th>
            <th width="15%">Status</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td rowspan="6"><strong>RELEASE 1</strong><br><em>05/Dez</em></td>
            <td><strong>US-12</strong></td>
            <td><strong>(Máquina de Estados)</strong> Implementar regras de transição: Auto-Aprovação (100% OK), Reprovação Automática e Aprovação com Ressalvas. [cite: 18]</td>
            <td>-</td>
            <td>8</td>
            <td class="status-sprint1">📅 Prioridade</td>
        </tr>
        <tr>
            <td><strong>US-15</strong></td>
            <td><strong>(Interface Documental)</strong> Dashboard para gestão de pendências e botões de ação (Aprovar/Reprovar com Ressalvas). [cite: 18]</td>
            <td>US-12</td>
            <td>5</td>
            <td class="status-sprint1">📅 A Fazer</td>
        </tr>
        <tr>
            <td><strong>US-20</strong></td>
            <td><strong>(Lacração Pós-Inspeção)</strong> Inspetor registra lacre inicial (1 a 3) somente após o "OK" (Status Aprovado). [cite: 18]</td>
            <td>US-12</td>
            <td>5</td>
            <td class="status-sprint1">📅 A Fazer</td>
        </tr>
        <tr>
            <td><strong>US-13</strong></td>
            <td><strong>(Fluxo Conferente)</strong> Fila "Aguardando Carregamento", registro de Deslacre e Relacre com evidências. [cite: 18]</td>
            <td>US-20</td>
            <td>8</td>
            <td class="status-sprint1">📅 A Fazer</td>
        </tr>
        <tr>
            <td><strong>US-PDF-1</strong></td>
            <td><strong>(Preparação PDF Backend)</strong> Estruturar dados para adicionar novas fotos e agrupar infos no nome do arquivo. [cite: 18]</td>
            <td>-</td>
            <td>3</td>
            <td class="status-sprint1">📅 A Fazer</td>
        </tr>
         <tr>
            <td><strong>US-11</strong></td>
            <td><strong>(Dados da Carga)</strong> Documental cria com Container/Placa e Inspetor insere Medidas. <em>(Requisito implícito da conexão de deptos)</em></td>
            <td>-</td>
            <td>3</td>
            <td class="status-sprint1">📅 A Fazer</td>
        </tr>
        <tr>
            <td rowspan="4"><strong>RELEASE 2</strong><br><em>19/Dez</em></td>
            <td><strong>US-21</strong></td>
            <td><strong>(Validação de Precinto)</strong> Conferente valida lacre de segurança final para liberar viagem. [cite: 22]</td>
            <td>US-13</td>
            <td>5</td>
            <td class="status-sprint2">🔒 Planejado</td>
        </tr>
        <tr>
            <td><strong>US-14</strong></td>
            <td><strong>(Gabarito Visual UX)</strong> Inspetor visualiza foto "Ideal vs Defeito" ao clicar nos itens. [cite: 22]</td>
            <td>-</td>
            <td>2</td>
            <td class="status-sprint2">🔒 Planejado</td>
        </tr>
        <tr>
            <td><strong>US-22A</strong></td>
            <td><strong>(Checklist de Saída)</strong> Interface para verificação de lacres fiscais (RFB, Armador) com evidências. [cite: 23]</td>
            <td>US-21</td>
            <td>5</td>
            <td class="status-sprint2">🔒 Planejado</td>
        </tr>
        <tr>
            <td><strong>US-PDF-2</strong></td>
            <td><strong>(Agregador de Dados)</strong> Otimização do Backend para agrupar dados complexos de Inspetor, Doc e Conferente. [cite: 23]</td>
            <td>US-PDF-1</td>
            <td>3</td>
            <td class="status-sprint2">🔒 Planejado</td>
        </tr>
        <tr>
            <td rowspan="3"><strong>RELEASE 3</strong><br><em>30/Dez</em></td>
            <td><strong>US-22B</strong></td>
            <td><strong>(Controle de Portaria)</strong> Tela simplificada para Porteiro verificar status "Liberado" e dar baixa física. [cite: 27]</td>
            <td>US-22A</td>
            <td>3</td>
            <td class="status-sprint3">🔒 Planejado</td>
        </tr>
        <tr>
            <td><strong>US-23</strong></td>
            <td><strong>(Relatório Final)</strong> Geração e salvamento automático do PDF completo na rede. [cite: 27]</td>
            <td>Todas</td>
            <td>5</td>
            <td class="status-sprint3">🔒 Planejado</td>
        </tr>
        <tr>
            <td><strong>TASK-DEP</strong></td>
            <td><strong>(Deploy & Infra)</strong> Instalação em produção, rede e backups. [cite: 27]</td>
            <td>-</td>
            <td>3</td>
            <td class="status-sprint3">🔒 Planejado</td>
        </tr>
    </tbody>
</table>
    <h1>🚀 Sprint Tática: Finalização & Portaria</h1>
    <div class="meta-box">
        <strong>Objetivo Único:</strong> Entregar o fluxo padrão (Exportação) completo: Da Lacração RFB até a Saída na Portaria.<br>
        <strong>Início:</strong> 12/Dez | <strong>Entrega Final:</strong> 22/Dez<br>
        <strong>Restrições:</strong> Fluxos alternativos (Sobre Rodas/Estufado) estão fora do escopo.
    </div>
    <h2>1. Correção de Bugs Bloqueantes (Prioridade Zero)</h2>
    <p><em>Estes itens impedem a homologação atual e devem ser resolvidos nos dias 12 e 13.</em></p>
    <table>
        <thead>
            <tr>
                <th width="10%">ID</th>
                <th width="50%">Bug / Ajuste</th>
                <th width="40%">Critério de Aceite</th>
            </tr>
        </thead>
        <tbody>
            <tr class="bug-fix">
                <td><strong>FIX-01</strong></td>
                <td><strong>Review Documental "Cego"</strong><br>O usuário Documental não vê as fotos dos itens reprovados na tela de análise.</td>
                <td>Ao clicar em um item reprovado, o modal deve abrir e carregar as fotos enviadas pelo inspetor.</td>
            </tr>
            <tr class="bug-fix">
                <td><strong>FIX-02</strong></td>
                <td><strong>Travamento Modal Upload</strong><br>Interface trava após envio de evidência na tela do inspetor.</td>
                <td>O modal deve fechar automaticamente ou permitir fechar manual após sucesso do upload. Status do item deve atualizar visualmente.</td>
            </tr>
            <tr class="bug-fix">
                <td><strong>FIX-03</strong></td>
                <td><strong>Alerta de Medidas</strong><br>Sistema permite finalizar sem medidas preenchidas.</td>
                <td>Botão "Finalizar" deve estar desabilitado ou disparar alerta se campos de medidas estiverem vazios.</td>
            </tr>
        </tbody>
    </table>
    <h2>2. Novos Fluxos: Lacração RFB & Portaria (Escopo da Sprint)</h2>
    <p><em>Desenvolvimento Core: Dias 15, 16, 17 e 18.</em></p>
    <table>
        <thead>
            <tr>
                <th width="10%">ID</th>
                <th width="50%">User Story (Funcionalidade)</th>
                <th width="40%">Regras de Negócio (Simplificadas)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>US-RFB-01</strong></td>
                <td><strong>Módulo Documental: Lacração RFB</strong><br>Interface para o Documental substituir o lacre do Conferente pelo da RFB.</td>
                <td>
                    1. Herdar numeração/ID do lacre anterior.<br>
                    2. Permitir foto do Lacre RFB.<br>
                    3. Permitir foto do Lacre Armador (Opcional).<br>
                    4. Assinatura Digital do Documental obrigatória.
                </td>
            </tr>
            <tr>
                <td><strong>US-RFB-02</strong></td>
                <td><strong>Lógica do Precinto</strong><br>Opcionalidade de fotos baseada na marcação prévia.</td>
                <td>
                    1. Se "Tem Precinto" = TRUE (marcado anteriormente): Exigir 4 fotos (Frente, Trás, Lat. Esq, Lat. Dir).<br>
                    2. Se FALSE: Exigir apenas 1 foto panorâmica (Traseira).
                </td>
            </tr>
            <tr>
                <td><strong>US-PORT-01</strong></td>
                <td><strong>Interface da Portaria (Saída)</strong><br>Tela de busca e conferência final.</td>
                <td>
                    1. Listar apenas veículos com status "Aguardando Saída".<br>
                    2. Exibir: Placa, Container, Nº Lacre RFB.<br>
                    3. Botões de Ação: "Confirmar Saída" (Verde) e "Rejeitar" (Vermelho).
                </td>
            </tr>
            <tr>
                <td><strong>US-PORT-02</strong></td>
                <td><strong>Finalização com Sucesso</strong><br>Ação do botão "Confirmar Saída".</td>
                <td>
                    1. Mudar status para "Finalizado".<br>
                    2. Registrar Timestamp (Data/Hora).<br>
                    3. <strong>Disparar Geração e Salvamento do PDF na Rede.</strong>
                </td>
            </tr>
        </tbody>
    </table>
    <h2>3. Tratamento de Exceções (O "Loop")</h2>
    <p><em>Desenvolvimento de Segurança: Dias 19 e 20.</em></p>
    <table>
        <thead>
            <tr>
                <th width="10%">ID</th>
                <th width="50%">Cenário</th>
                <th width="40%">Comportamento do Sistema</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>US-EXC-01</strong></td>
                <td><strong>Portaria Rejeita: Erro de Digitação</strong><br>Porteiro nota que Placa ou Nº Container no sistema difere do físico.</td>
                <td>
                    1. Portaria seleciona motivo "Erro Cadastral".<br>
                    2. Status muda para "Correção Documental".<br>
                    3. Documental edita os campos e devolve para "Aguardando Saída".
                </td>
            </tr>
            <tr>
                <td><strong>US-EXC-02</strong></td>
                <td><strong>Portaria Rejeita: Lacre Rompido</strong><br>Porteiro nota divergência no lacre físico vs sistema.</td>
                <td>
                    1. Portaria seleciona motivo "Lacre Divergente" + Foto Evidência.<br>
                    2. Status volta para etapa "Lacração RFB".<br>
                    3. Documental deve refazer o processo de lacração (Novo nº e fotos).
                </td>
            </tr>
        </tbody>
    </table>
    <h2>4. Cronograma Diário (Plano de Ataque)</h2>
    <ul>
        <li><strong>12/Dez (Sex):</strong> Bugs FIX-01, FIX-02 e FIX-03 (Limpar a casa).</li>
        <li><strong>15/Dez (Seg):</strong> US-RFB-01 e US-RFB-02 (Tela RFB e Precinto).</li>
        <li><strong>16/Dez (Ter):</strong> US-PORT-01 (Tela Portaria Leitura).</li>
        <li><strong>17/Dez (Qua):</strong> US-PORT-02 (Lógica de Finalização + PDF).</li>
        <li><strong>18/Dez (Qui):</strong> Teste de salvamento de PDF em rede (Infraestrutura).</li>
        <li><strong>19/Dez (Sex):</strong> US-EXC-01 e US-EXC-02 (Loops de Rejeição).</li>
        <li><strong>20/Dez (Sáb*):</strong> Testes gerais de ponta a ponta e Deploy em Homologação.</li>
        <li><strong>22/Dez (Seg):</strong> Entrega Oficial e Code Freeze.</li>
    </ul>
    <hr>
    <h2>5. Backlog Geral (Funcionalidades Futuras & Fluxos Alternativos)</h2>
    <p><em>Itens mapeados nas reuniões de 09 e 10/12, mas que ficam para o Pós-MVP (Janeiro/2026).</em></p>
    <table class="future-backlog">
        <thead>
            <tr>
                <th class="future-header" width="10%">ID</th>
                <th class="future-header" width="40%">User Story (Funcionalidade)</th>
                <th class="future-header" width="50%">Descrição & Lógica (Fluxo Novo)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>US-PORT-03</strong></td>
                <td><strong>Portaria: Registro de Entrada</strong><br>(Início do Fluxo Variável)</td>
                <td>Abertura da Inspeção pela Portaria. Captura de <strong>Foto Lacre Entrada</strong> e <strong>Foto Carga</strong>. Definição obrigatória do <strong>Tipo de Veículo</strong> (que define o workflow).</td>
            </tr>
            <tr>
                <td><strong>US-UX-01</strong></td>
                <td><strong>Gabarito Visual</strong><br>(Auxílio ao Inspetor)</td>
                <td>Adicionar ícone em cada item do checklist que abre um modal com "Foto Exemplo" do que deve ser inspecionado (Item 2 da reunião).</td>
            </tr>
            <tr>
                <td><strong>US-UX-02</strong></td>
                <td><strong>Máscara de Placa Inteligente</strong></td>
                <td>Campo de placa deve aceitar padrão Mercosul e Antigo, limitando caracteres e forçando caixa alta, sem bloquear o fluxo (Item 3).</td>
            </tr>
            <tr>
                <td><strong>US-FLUX-B</strong></td>
                <td><strong>Fluxo B: Sobre Rodas</strong><br>(Importação/Container Cheio)</td>
                <td>Configurar workflow: <em>Portaria -> Inspetor (18 Pontos) -> Documental -> Portaria</em>. <strong>Pula etapa do Conferente</strong> e remove lógica de precinto (Item 14).</td>
            </tr>
            <tr>
                <td><strong>US-FLUX-C</strong></td>
                <td><strong>Fluxo C: Saída Estufado</strong><br>(Caminhão Vazio)</td>
                <td>Configurar workflow invertido: <em>Portaria -> Conferente (Carregamento) -> Inspetor -> Documental -> Portaria</em>. (Item 14).</td>
            </tr>
            <tr>
                <td><strong>US-FEAT-05</strong></td>
                <td><strong>Parametrização Opcional</strong></td>
                <td>Tornar a seleção de "Parametrização do Canal" (Verde/Laranja/Vermelho) opcional na tela de abertura da Portaria (Item 9).</td>
            </tr>
        </tbody>
    </table>
