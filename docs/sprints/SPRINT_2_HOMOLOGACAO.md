📊 Backlog Técnico Consolidado: Release 1 (Fluxo Interno)
Meta: Implementar o ciclo de vida completo da carga (Inspetor ↔ Documental ↔ Conferente) com validações de segurança. Total de Story Points (SP): 39 SP


<table border="1" cellpadding="8" cellspacing="0" width="100%"> <thead> <tr bgcolor="#24292e" style="color:white;"> <th width="10%" align="center">User Story</th> <th width="10%" align="center">ID Task</th> <th width="60%">Descrição Técnica (Task)</th> <th width="10%" align="center">Pontos</th> <th width="10%" align="center">Stack</th> </tr> </thead> <tbody> <tr bgcolor="#f6f8fa"> <td rowspan="3" valign="top"><strong>US-12</strong>

<small>Máquina de Estados</small></td> <td align="center"><strong>TASK-12.1</strong></td> <td><code>[BE]</code> <strong>Auto-Approval Logic:</strong> Implementar regra de ouro: Checklist 100% Conforme = Status 2 (Aprovado); 1 Erro = Status 3 (Reprovado).</td> <td align="center"><strong>5</strong></td> <td align="center">NestJS</td> </tr> <tr bgcolor="#f6f8fa"> <td align="center"><strong>TASK-12.2</strong></td> <td><code>[BE]</code> <strong>Guardrails:</strong> Bloquear edição de inspeções com status != EM_INSPECAO (Interceptores/Guards).</td> <td align="center"><strong>2</strong></td> <td align="center">NestJS</td> </tr> <tr bgcolor="#f6f8fa"> <td align="center"><strong>TASK-12.3</strong></td> <td><code>[BE]</code> <strong>Override Endpoint:</strong> Criar rota para Documental aprovar inspeção reprovada (com justificativa obrigatória).</td> <td align="center"><strong>2</strong></td> <td align="center">NestJS</td> </tr>
    <tr>
        <td rowspan="3" valign="top"><strong>US-11</strong><br><small>Dados da Carga</small></td>
        <td align="center"><strong>TASK-11.1</strong></td>
        <td><code>[FE]</code> <strong>Create UI (Doc):</strong> Tela de criação Web com inputs de Placa, RE e Container (Máscara ABCD1234567).</td>
        <td align="center"><strong>1</strong></td>
        <td align="center">Vue</td>
    </tr>
    <tr>
        <td align="center"><strong>TASK-11.2</strong></td>
        <td><code>[FE]</code> <strong>Measure UI (Insp):</strong> Inputs de Comprimento, Largura e Altura na tela inicial do Inspetor com alerta de desvio padrão.</td>
        <td align="center"><strong>1</strong></td>
        <td align="center">Vue</td>
    </tr>
    <tr>
        <td align="center"><strong>TASK-11.3</strong></td>
        <td><code>[BE]</code> <strong>Migration & DTO:</strong> Adicionar coluna <code>container_number</code> e validar inputs de medidas.</td>
        <td align="center"><strong>1</strong></td>
        <td align="center">DB/Nest</td>
    </tr>
    <tr bgcolor="#f6f8fa">
        <td rowspan="4" valign="top"><strong>US-15</strong><br><small>Interface Doc</small></td>
        <td align="center"><strong>TASK-15.1</strong></td>
        <td><code>[FE]</code> <strong>Dashboard Pendências:</strong> Listar inspeções com status REPROVADO (3) com indicador de urgência.</td>
        <td align="center"><strong>2</strong></td>
        <td align="center">Vue</td>
    </tr>
    <tr bgcolor="#f6f8fa">
        <td align="center"><strong>TASK-15.2</strong></td>
        <td><code>[FE]</code> <strong>Highlight UI:</strong> Destacar visualmente itens "Não Conforme" na tela de detalhes da inspeção.</td>
        <td align="center"><strong>2</strong></td>
        <td align="center">Vue</td>
    </tr>
    <tr bgcolor="#f6f8fa">
        <td align="center"><strong>TASK-15.3</strong></td>
        <td><code>[BE]</code> <strong>Exception Logic:</strong> Endpoint para salvar justificativa/providências e mudar status de 3 para 2.</td>
        <td align="center"><strong>3</strong></td>
        <td align="center">NestJS</td>
    </tr>
    <tr bgcolor="#f6f8fa">
        <td align="center"><strong>TASK-15.4</strong></td>
        <td><code>[FE]</code> <strong>Action Modal:</strong> UI (Dialog) para inserir Justificativa e Providências ao aprovar com ressalva.</td>
        <td align="center"><strong>1</strong></td>
        <td align="center">Vue</td>
    </tr>
    <tr>
        <td rowspan="5" valign="top"><strong>US-20</strong><br><small>Lacração Insp</small></td>
        <td align="center"><strong>TASK-20.1</strong></td>
        <td><code>[FE]</code> <strong>Nav & Queue:</strong> Separar lista de trabalho: "A Inspecionar" vs "A Lacrar" (Status 2).</td>
        <td align="center"><strong>1</strong></td>
        <td align="center">Vue</td>
    </tr>
    <tr>
        <td align="center"><strong>TASK-20.2</strong></td>
        <td><code>[FE]</code> <strong>Dynamic Form:</strong> Interface para adicionar 1 a 3 Lacres e Placas (Campos dinâmicos e validação).</td>
        <td align="center"><strong>2</strong></td>
        <td align="center">Vue</td>
    </tr>
    <tr>
        <td align="center"><strong>TASK-20.3</strong></td>
        <td><code>[DB]</code> <strong>Migration 1:N:</strong> Criar tabelas <code>inspection_seals</code> e <code>inspection_images</code> (DBA).</td>
        <td align="center"><strong>1</strong></td>
        <td align="center">MySQL</td>
    </tr>
    <tr>
        <td align="center"><strong>TASK-20.4</strong></td>
        <td><code>[BE]</code> <strong>Seal Endpoint:</strong> Transaction para salvar múltiplos lacres/fotos e mover para Status 5.</td>
        <td align="center"><strong>2</strong></td>
        <td align="center">NestJS</td>
    </tr>
    <tr>
        <td align="center"><strong>TASK-20.5</strong></td>
        <td><code>[FE]</code> <strong>Gatekeeper:</strong> Remover redirecionamento automático. Validar assinatura e status antes de liberar lacre.</td>
        <td align="center"><strong>2</strong></td>
        <td align="center">Vue</td>
    </tr>
    <tr bgcolor="#f6f8fa">
        <td rowspan="3" valign="top"><strong>US-13</strong><br><small>Conferente</small></td>
        <td align="center"><strong>TASK-13.1</strong></td>
        <td><code>[FE]</code> <strong>Mobile Dash:</strong> Fila de trabalho para Status 5 (EM_CONFERENCIA) com Card Mobile-First.</td>
        <td align="center"><strong>2</strong></td>
        <td align="center">Vue</td>
    </tr>
    <tr bgcolor="#f6f8fa">
        <td align="center"><strong>TASK-13.2</strong></td>
        <td><code>[BE]</code> <strong>Start Ops:</strong> Endpoint para registrar Timestamp de Início (Deslacre) e retornar lacres iniciais.</td>
        <td align="center"><strong>2</strong></td>
        <td align="center">NestJS</td>
    </tr>
    <tr bgcolor="#f6f8fa">
        <td align="center"><strong>TASK-13.3</strong></td>
        <td><code>[FS]</code> <strong>Finish Ops:</strong> UI e Backend para Relacre final (Múltiplos) e fotos panorâmicas (Fecha Status 6).</td>
        <td align="center"><strong>4</strong></td>
        <td align="center">Fullstack</td>
    </tr>
    <tr>
        <td rowspan="2" valign="top"><strong>US-PDF-1</strong><br><small>Backend PDF</small></td>
        <td align="center"><strong>TASK-PDF1.1</strong></td>
        <td><code>[BE]</code> <strong>Snapshot Service:</strong> Criar DTO Aggregator (JSON Snapshot) com dados de todas as etapas e fotos.</td>
        <td align="center"><strong>2</strong></td>
        <td align="center">NestJS</td>
    </tr>
    <tr>
        <td align="center"><strong>TASK-PDF1.2</strong></td>
        <td><code>[BE]</code> <strong>File Naming:</strong> Implementar padrão de nome <code>RE_PLACA_DATA.pdf</code>.</td>
        <td align="center"><strong>1</strong></td>
        <td align="center">NestJS</td>
    </tr>
</tbody>
<tfoot>
    <tr bgcolor="#24292e" style="color:white;">
        <td colspan="3" align="right"><strong>TOTAL DE STORY POINTS</strong></td>
        <td align="center" colspan="2"><strong>39</strong></td>
    </tr>
</tfoot>
</table>
