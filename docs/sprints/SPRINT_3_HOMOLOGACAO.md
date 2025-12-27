<h3>🚀 Backlog Técnico: Sprint Final (12/Dez - 22/Dez)</h3>
<p><strong>Meta:</strong> Fluxo "End-to-End" de Exportação (Lacração RFB até Saída Portaria) + Estabilidade.</p>

<table border="1" cellpadding="8" cellspacing="0" width="100%" style="font-family: Arial, sans-serif; border-collapse: collapse;">
    <thead>
        <tr style="background-color: #2c3e50; color: white;">
            <th width="10%">ID Task</th>
            <th width="8%">US Pai</th>
            <th width="5%" align="center">Tipo</th>
            <th width="67%">Descrição Técnica (Resumo da Issue)</th>
            <th width="10%" align="center">Pontos</th>
        </tr>
    </thead>
    <tbody>
        <tr style="background-color: #ffebee;">
            <td colspan="5"><strong>🛑 Bloco 1: Bugs Bloqueantes (Prioridade Zero)</strong></td>
        </tr>
        <tr>
            <td><strong>TASK-FIX-01</strong></td>
            <td>FIX-01</td>
            <td align="center"><span style="color: #e67e22; font-weight: bold;">FE</span></td>
            <td>
                <strong>Corrigir Binding da Galeria (Doc Review):</strong><br>
                Ajustar <code>InspectionReviewModal</code> para iterar corretamente sobre <code>item.evidences</code>. Modal abria sem fotos.
            </td>
            <td align="center"><strong>1</strong></td>
        </tr>
        <tr>
            <td><strong>TASK-FIX-02</strong></td>
            <td>FIX-02</td>
            <td align="center"><span style="color: #e67e22; font-weight: bold;">FE</span></td>
            <td>
                <strong>Corrigir Travamento Modal Upload:</strong><br>
                Garantir reset de <code>isUploading = false</code> no <code>.finally()</code> e limpar input file após sucesso.
            </td>
            <td align="center"><strong>1</strong></td>
        </tr>
        <tr>
            <td><strong>TASK-FIX-03</strong></td>
            <td>FIX-03</td>
            <td align="center"><span style="color: #8e44ad; font-weight: bold;">FS</span></td>
            <td>
                <strong>Validação Obrigatória de Medidas:</strong><br>
                <strong>FE:</strong> Bloquear botão "Finalizar" se medidas vazias.<br>
                <strong>BE:</strong> Adicionar DTO decorators <code>@IsNotEmpty()</code> no endpoint de finalização.
            </td>
            <td align="center"><strong>2</strong></td>
        </tr>
        <tr style="background-color: #e3f2fd;">
            <td colspan="5"><strong>👮 Bloco 2: Módulo RFB (Documental)</strong></td>
        </tr>
        <tr>
            <td><strong>TASK-RFB-01</strong></td>
            <td>US-RFB-01</td>
            <td align="center"><span style="color: #2980b9; font-weight: bold;">BE</span></td>
            <td>
                <strong>Endpoint Lacração RFB:</strong><br>
                Rota <code>POST /rfb-seal</code>. Recebe Lacre RFB + Foto (Obrigatória) e Armador (Opcional). Move status para <code>WAITING_EXIT</code>.
            </td>
            <td align="center"><strong>3</strong></td>
        </tr>
        <tr>
            <td><strong>TASK-RFB-02</strong></td>
            <td>US-RFB-01</td>
            <td align="center"><span style="color: #e67e22; font-weight: bold;">FE</span></td>
            <td>
                <strong>Tela de Lacração RFB:</strong><br>
                View para Documental. Inputs de Lacre RFB e Armador. Botão de "Assinar e Liberar".
            </td>
            <td align="center"><strong>3</strong></td>
        </tr>
        <tr>
            <td><strong>TASK-RFB-03</strong></td>
            <td>US-RFB-02</td>
            <td align="center"><span style="color: #e67e22; font-weight: bold;">FE</span></td>
            <td>
                <strong>Lógica Condicional de Precinto:</strong><br>
                Se <code>hasPrecinto == true</code>, renderizar 4 uploads obrigatórios (Frente/Trás/Lat). Se false, apenas 1 (Traseira).
            </td>
            <td align="center"><strong>2</strong></td>
        </tr>
        <tr style="background-color: #e8f5e9;">
            <td colspan="5"><strong>🚧 Bloco 3: Portaria & Saída (Critical Path)</strong></td>
        </tr>
        <tr>
            <td><strong>TASK-PORT-01</strong></td>
            <td>US-PORT-01</td>
            <td align="center"><span style="color: #2980b9; font-weight: bold;">BE</span></td>
            <td>
                <strong>Endpoints Portaria:</strong><br>
                1. <code>GET /gate/queue</code> (Filtra status WAITING_EXIT).<br>
                2. <code>POST /gate/exit</code> (Registra timestamp e finaliza).
            </td>
            <td align="center"><strong>2</strong></td>
        </tr>
        <tr>
            <td><strong>TASK-PORT-02</strong></td>
            <td>US-PORT-01</td>
            <td align="center"><span style="color: #e67e22; font-weight: bold;">FE</span></td>
            <td>
                <strong>Dashboard Portaria (High Vis):</strong><br>
                Cards grandes com Placa/Lacre. Botões gigantes de "Liberar" (Verde) e "Rejeitar" (Vermelho).
            </td>
            <td align="center"><strong>3</strong></td>
        </tr>
        <tr style="background-color: #fffde7;">
            <td><strong>TASK-PORT-03</strong></td>
            <td>US-PORT-02</td>
            <td align="center"><span style="color: #2980b9; font-weight: bold;">BE</span></td>
            <td>
                <strong>⚠️ Serviço PDF Final & Rede:</strong><br>
                Gerar Snapshot completo (Aggregator), renderizar PDF e salvar em <code>\\SERVER\Share</code>. Fallback local em caso de erro de rede.
            </td>
            <td align="center"><strong>5</strong></td>
        </tr>
        <tr style="background-color: #f5f5f5;">
            <td colspan="5"><strong>↩️ Bloco 4: Tratamento de Exceções (Loops)</strong></td>
        </tr>
        <tr>
            <td><strong>TASK-EXC-01</strong></td>
            <td>US-EXC-01</td>
            <td align="center"><span style="color: #2980b9; font-weight: bold;">BE</span></td>
            <td>
                <strong>Endpoint Rejeição (Erro Dados):</strong><br>
                <code>POST /gate/reject</code> com motivo 'WRONG_DATA' -> Move status para <code>DOC_CORRECTION</code>.
            </td>
            <td align="center"><strong>2</strong></td>
        </tr>
        <tr>
            <td><strong>TASK-EXC-02</strong></td>
            <td>US-EXC-02</td>
            <td align="center"><span style="color: #2980b9; font-weight: bold;">BE</span></td>
            <td>
                <strong>Endpoint Rejeição (Lacre Divergente):</strong><br>
                Motivo 'SEAL_DIVERGENCE' exige foto de evidência -> Move status para <code>RFB_SEAL</code> (Volta proc. Documental).
            </td>
            <td align="center"><strong>2</strong></td>
        </tr>
        <tr>
            <td><strong>TASK-EXC-03</strong></td>
            <td>US-EXC-01</td>
            <td align="center"><span style="color: #e67e22; font-weight: bold;">FE</span></td>
            <td>
                <strong>Modal Rejeição Portaria:</strong><br>
                Select de motivo + Textarea + Upload condicional (Se lacre divergente).
            </td>
            <td align="center"><strong>2</strong></td>
        </tr>
    </tbody>
    <tfoot>
        <tr style="background-color: #2c3e50; color: white;">
            <td colspan="4" align="right"><strong>TOTAL SPRINT FINAL:</strong></td>
            <td align="center"><strong>28 SP</strong></td>
        </tr>
    </tfoot>
</table>
