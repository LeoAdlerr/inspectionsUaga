<table>
    <thead>
        <tr>
            <th>ID (Sprint)</th>
            <th class="center">Ordem Rec.</th>
            <th>Épico (Fonte)</th>
            <th>User Story / Bug</th>
            <th>Dependências</th>
            <th>Requisitos Resolvidos</th>
            <th class="points-column">Pontos</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>US-01</strong></td>
            <td class="center">1</td>
            <td>Épico 2</td>
            <td><strong>(BUG)</strong> Permitir finalizar inspeção com status "N/A".</td>
            <td>Nenhuma</td>
            <td>Correções Imediatas (Blockers)</td>
            <td class="points-column">2</td>
        </tr>
        <tr>
            <td><strong>US-02</strong></td>
            <td class="center">2</td>
            <td>Épico 2</td>
            <td><strong>(BUG)</strong> Bloquear o campo "Modalidade" após a criação.</td>
            <td>Nenhuma</td>
            <td>Correções Imediatas (Blockers)</td>
            <td class="points-column">1</td>
        </tr>
        <tr>
            <td><strong>US-03</strong></td>
            <td class="center">3</td>
            <td>Épico 1</td>
            <td><strong>(US-13)</strong> Criação de Inspeção "Órfã" (Backend + UI Setor Documental).</td>
            <td>Nenhuma</td>
            <td>Fluxo "Setor Documental"</td>
            <td class="points-column">5</td>
        </tr>
        <tr>
            <td><strong>US-04</strong></td>
            <td class="center">4</td>
            <td>Épico 3</td>
            <td><strong>(US-15)</strong> Coleta de Evidências (Lacre e Assinatura do Inspetor) na tela de Finalização.</td>
            <td>Nenhuma</td>
            <td>Fluxo de Finalização (Inspetor)</td>
            <td class="points-column">8</td>
        </tr>
        <tr>
            <td><strong>US-05</strong></td>
            <td class="center">5</td>
            <td>Épico 4</td>
            <td><strong>(US-16)</strong> Captura de Assinatura obrigatória do Motorista na tela de Finalização.</td>
            <td><strong>US-04</strong></td>
            <td>Coleta de Assinatura (Motorista)</td>
            <td class="points-column">3</td>
        </tr>
        <tr>
            <td><strong>US-06</strong></td>
            <td class="center">6</td>
            <td>Épico 6</td>
            <td><strong>(US-18)</strong> Fila de Trabalho do Conferente (Backend + UI) e status "Aguardando Conferência".</td>
            <td><strong>US-04</strong></td>
            <td>Fluxo do Conferente</td>
            <td class="points-column">5</td>
        </tr>
        <tr>
            <td><strong>US-07</strong></td>
            <td class="center">7</td>
            <td>Épico 1</td>
            <td><strong>(US-14)</strong> UI para Inspetor "Assumir" inspeção pendente.</td>
            <td><strong>US-03</strong></td>
            <td>Fluxo "Setor Documental"</td>
            <td class="points-column">3</td>
        </tr>
        <tr>
            <td><strong>US-08</strong></td>
            <td class="center">8</td>
            <td>Épico 6</td>
            <td><strong>(US-19)</strong> Conclusão da Conferência (Upload de fotos e status "Concluída").</td>
            <td><strong>US-06</strong></td>
            <td>Fluxo do Conferente</td>
            <td class="points-column">5</td>
        </tr>
        <tr>
            <td><strong>US-09</strong></td>
            <td class="center">9</td>
            <td>Épico 5</td>
            <td><strong>(US-17)</strong> Atualizar Relatório PDF com todas as novas assinaturas e fotos de lacre.</td>
            <td><strong>US-04, US-05, US-08</strong></td>
            <td>Atualização do Relatório PDF</td>
            <td class="points-column">8</td>
        </tr>
        <tr>
            <td><strong>US-10</strong></td>
            <td class="center">10</td>
            <td>Épico 7</td>
            <td><strong>(US-07 QoL)</strong> Implementar botão "Salvar e ir para Próximo Ponto".</td>
            <td>Nenhuma</td>
            <td>UI "Próximo Ponto" (QoL)</td>
            <td class="points-column">3</td>
        </tr>
        <tr bgcolor="#f2f7ff">
            <td colspan="6" align="right"><strong>TOTAL DE STORY POINTS (SPRINT)</strong></td>
            <td class="points-column" style="font-size: 1.4em; background-color: #fffde7;">43</td>
        </tr>
    </tbody>
</table>

<h2 id="lista-mestra-tarefas">📋 Lista Mestra de Tarefas (Sprint para 14/Nov)</h2>
<p>Backlog completo de todas as tarefas técnicas refinadas, agrupadas por User Story, para a entrega da meta de 14 de Novembro.</p>

<table border="1" cellpadding="10" cellspacing="0" width="100%">
    <thead>
        <tr bgcolor="#f2f7ff">
            <th align="left" style="width: 15%;"><b>User Story Pai</b></th>
            <th align="left" style="width: 10%;"><b>ID da Task</b></th>
            <th align="left" style="width: 60%;"><b>Título da Tarefa</b></th>
            <th align="center" style="width: 15%;"><b>Pontos (SP)</b></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td valign="top" rowspan="2"><strong>US-01</strong> (2 SP)</td>
            <td>TASK-01.1</td>
            <td><code>[BE]</code> (Bug) Tratar "N/A" como estado completo na finalização da inspeção.</td>
            <td align="center">1</td>
        </tr>
        <tr>
            <td>TASK-01.2</td>
            <td><code>[FE]</code> (Bug) Habilitar botão "Revisar e Finalizar" quando itens são "N/A".</td>
            <td align="center">1</td>
        </tr>
        <tr>
            <td valign="top"><strong>US-02</strong> (1 SP)</td>
            <td>TASK-02.1</td>
            <td><code>[FE]</code> (Bug) Bloquear o campo "Modalidade" após a criação da inspeção.</td>
            <td align="center">1</td>
        </tr>
        <tr>
            <td valign="top" rowspan="2"><strong>US-03</strong> (5 SP)</td>
            <td>TASK-03.1</td>
            <td><code>[BE]</code> Implementar criação de inspeção com checklist dinâmico.</td>
            <td align="center">3</td>
        </tr>
        <tr>
            <td>TASK-03.2</td>
            <td><code>[FE]</code> Desenvolver a página "Criar Nova Inspeção" para o Documental.</td>
            <td align="center">2</td>
        </tr>
        <tr>
            <td valign="top" rowspan="3"><strong>US-04</strong> (8 SP)</td>
            <td>TASK-04.1</td>
            <td><code>[BE]</code> Atualizar endpoint de finalização para receber lacre e assinatura do inspetor.</td>
            <td align="center">4</td>
        </tr>
        <tr>
            <td>TASK-04.2</td>
            <td><code>[FE]</code> Adicionar campos de Lacre e Assinatura do Inspetor na Tela de Finalização.</td>
            <td align="center">3</td>
        </tr>
        <tr>
            <td>TASK-04.3</td>
            <td><code>[Test]</code> Atualizar teste E2E para o novo fluxo de finalização do Inspetor.</td>
            <td align="center">1</td>
        </tr>
        <tr>
            <td valign="top" rowspan="2"><strong>US-05</strong> (3 SP)</td>
            <td>TASK-05.1</td>
            <td><code>[BE]</code> Atualizar endpoint de finalização para receber e salvar a assinatura do motorista.</td>
            <td align="center">1</td>
        </tr>
        <tr>
            <td>TASK-05.2</td>
            <td><code>[FE]</code> Adicionar componente de Assinatura do Motorista na Tela de Finalização.</td>
            <td align="center">2</td>
        </tr>
        <tr>
            <td valign="top" rowspan="2"><strong>US-06</strong> (5 SP)</td>
            <td>TASK-06.1</td>
            <td><code>[BE]</code> Implementar estado "Aguardando Conferência" e API de fila de trabalho.</td>
            <td align="center">3</td>
        </tr>
        <tr>
            <td>TASK-06.2</td>
            <td><code>[FE]</code> Desenvolver a página "Fila de Trabalho do Conferente".</td>
            <td align="center">2</td>
        </tr>
        <tr>
            <td valign="top" rowspan="2"><strong>US-07</strong> (3 SP)</td>
            <td>TASK-07.1</td>
            <td><code>[FE]</code> Criar dashboard do Inspetor para listar inspeções pendentes.</td>
            <td align="center">2</td>
        </tr>
        <tr>
            <td>TASK-07.2</td>
            <td><code>[BE]</code> Criar endpoint para o Inspetor "assumir" uma inspeção.</td>
            <td align="center">1</td>
        </tr>
        <tr>
            <td valign="top" rowspan="2"><strong>US-08</strong> (5 SP)</td>
            <td>TASK-08.1</td>
            <td><code>[BE]</code> Implementar endpoint para o Conferente concluir a conferência (com upload de fotos).</td>
            <td align="center">3</td>
        </tr>
        <tr>
            <td>TASK-08.2</td>
            <td><code>[FE]</code> Desenvolver a página de "Conclusão da Conferência".</td>
            <td align="center">2</td>
        </tr>
        <tr>
            <td valign="top" rowspan="3"><strong>US-09</strong> (8 SP)</td>
            <td>TASK-09.1</td>
            <td><code>[BE]</code> Refatorar serviço de relatório para agregar dados de assinatura e lacres.</td>
            <td align="center">3</td>
        </tr>
        <tr>
            <td>TASK-09.2</td>
            <td><code>[BE]</code> Redesenhar o template HTML do PDF para incluir assinaturas e evidências de lacre.</td>
            <td align="center">3</td>
        </tr>
        <tr>
            <td>TASK-09.3</td>
            <td><code>[FE/Test]</code> Validar fluxo de download e atualizar testes E2E para o novo PDF.</td>
            <td align="center">2</td>
        </tr>
        <tr>
            <td valign="top" rowspan="2"><strong>US-10</strong> (3 SP)</td>
            <td>TASK-10.1</td>
            <td><code>[FE]</code> Criar lógica de navegação para "Próximo Ponto Pendente".</td>
            <td align="center">2</td>
        </tr>
        <tr>
            <td>TASK-10.2</td>
            <td><code>[FE]</code> Adicionar botão "Salvar e ir para Próximo Ponto" na UI do Checklist.</td>
            <td align="center">1</td>
        </tr>
    </tbody>
    <tfoot>
        <tr bgcolor="#f2f7ff">
            <td align="right" colspan="3"><strong>Total de Tarefas / Pontos:</strong></td>
            <td align="center" style="font-size: 1.2em; font-weight: bold;">21 / 43</td>
        </tr>
    </tfoot>
</table>