<div align="center">
    <a href="https://www.mysql.com/" target="blank"><img src="https://www.mysql.com/common/logos/logo-mysql-170x115.png"
            width="150" alt="MySQL Logo"></a>
    <h1 align="center">Documentação do Banco de Dados - Inspeção Digital 8/18</h1>
    <p align="center">
        <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white"
            alt="MySQL 8.0">
        <img src="https://img.shields.io/badge/Schema-3ª_Forma_Normal-28A745?style=for-the-badge" alt="Schema em 3FN">
        <img src="https://img.shields.io/badge/Status-Estável-blue?style=for-the-badge" alt="Status Estável">
    </p>
</div>

<h2 id="visao-geral">📜 Visão Geral</h2>
<p>
    Este repositório contém toda a documentação, scripts e artefatos relacionados à camada de persistência da Aplicação
    de Inspeção Digital. O objetivo é servir como a <strong>fonte única da verdade</strong> para a estrutura de dados
    que suporta o sistema.
</p>

<h2 id="sumario">📖 Sumário</h2>
<ul>
    <li><a href="#guia-rapido">Guia Rápido (Como Começar)</a></li>
    <li><a href="#guia-de-contribuicao">Guia de Contribuição (Específico do BD)</a>
        <ul>
            <li><a href="#desenvolvimento-paralelo">O BD como Contrato para o Desenvolvimento Paralelo</a></li>
            <li><a href="#governanca-schema">Governança e Evolução do Schema</a></li>
            <li><a href="#scripts-uteis">Scripts Úteis para Desenvolvimento</a></li>
        </ul>
    </li>
    <li><a href="#arquitetura-dados">Arquitetura e Dicionário de Dados</a>
        <ul>
            <li><a href="#mer">Modelo de Entidade-Relacionamento (MER)</a></li>
            <li><a href="#dicionario-de-dados-completo">Dicionário de Dados Completo</a></li>
            <li><a href="#decisoes-design">Decisões de Design</a></li>
        </ul>
    </li>
    <li><a href="#detalhes-implementacao">Detalhes de Implementação</a></li>
</ul>
<hr>

<h2 id="guia-rapido">🚀 Guia Rápido (Como Começar)</h2>
<p>Esta seção é para você que precisa apenas "subir" o banco de dados para trabalhar em outra frente do projeto.</p>

<h4>Para Desenvolvedores (Backend/Frontend)</h4>
<p>
    Para iniciar o banco de dados como parte do ambiente de desenvolvimento completo, execute o seguinte comando a
    partir da <strong>pasta raiz do projeto principal</strong>:
</p>
<pre><code># Usando Docker
docker compose up -d db

# Usando Podman

podman-compose up -d db</code></pre>
<p>O banco de dados estará acessível em <code>localhost:3307</code> e pronto para ser consumido pela API.</p>

<h4>Para DBAs e Desenvolvimento Focado no Banco</h4>
<p>
    Se você precisa trabalhar exclusively no schema, execute os comandos a partir <strong>desta pasta</strong>
    (<code>/checklist-8-18-bd</code>):
</p>
<pre><code>podman-compose up --build -d</code></pre>
<p>
    Na primeira execução, o container irá popular o banco com o schema e os dados iniciais, e em seguida, validará a
    lógica com o script <code>casosDeUso.sql</code>.
</p>

<hr>

<h2 id="guia-de-contribuicao">🤝 Guia de Contribuição (Específico do BD)</h2>
<p>
    Para as diretrizes gerais do projeto (branching, PRs, etc.), consulte o <a href="../CONTRIBUTING.md">Guia de
        Contribuição Principal</a>. Abaixo estão as nuances específicas para trabalhar com o banco de dados.
</p>

<h3 id="desenvolvimento-paralelo">O Banco de Dados como Contrato para o Desenvolvimento Paralelo</h3>
<p>
    Nossa filosofia de trabalho visa minimizar bloqueios entre as equipes. O schema do banco de dados, definido e
    documentado neste repositório, funciona como um <strong>contrato imutável</strong> para o time de Backend.
</p>
<blockquote>
    <p>
        <strong>Como isso funciona na prática?</strong><br>
        Uma vez que uma nova estrutura de tabela ou coluna é definida, documentada no Dicionário de Dados e aprovada, o
        <strong>time de Backend não precisa esperar</strong> a migração ser aplicada em todos os ambientes. Eles podem
        imediatamente começar a desenvolver suas lógicas de negócio, mockando a camada de acesso a dados (repositórios)
        com base neste contrato.
    </p>
</blockquote>

<h3 id="governanca-schema">Governança e Evolução do Schema ("Database First")</h3>
<p>
    A evolução do schema segue uma abordagem estrita e segura de <strong>"Database First"</strong>. A autoridade para
    modificar o schema pertence ao DBA, com validação do Product Owner (PO). A aplicação backend <strong>nunca</strong>
    deve alterar o banco (<code>DB_SYNCHRONIZE='false'</code>).
</p>
<p>O fluxo para qualquer alteração é:</p>
<ol>
    <li><strong>Proposta de Mudança:</strong> O Desenvolvedor ou PO formaliza a necessidade.</li>
    <li><strong>Análise e Aprovação:</strong> O PO valida o valor de negócio e o DBA analisa o impacto técnico.</li>
    <li><strong>Desenvolvimento da Migração:</strong> O DBA cria um script SQL de migração versionado (ex:
        <code>V2__Add_inspections_priority_column.sql</code>).
    </li>
    <li><strong>Aplicação Controlada:</strong> O DBA aplica o script nos ambientes.</li>
    <li><strong>Sincronização da Aplicação:</strong> Somente após a migração, o Desenvolvedor backend atualiza as
        entidades do TypeORM no código.</li>
</ol>

<h3 id="scripts-uteis">Scripts Úteis para Desenvolvimento e Validação</h3>
<ul>
    <li><strong><code>casosDeUso.sql</code>:</strong> Um script poderoso que simula os fluxos da aplicação diretamente
        no banco. Excelente para testar a integridade do modelo e otimizações.</li>
    <li><strong>Script de Limpeza:</strong> Antes de rodar o <code>casosDeUso.sql</code>, use o script de reset abaixo
        para limpar os dados transacionais e evitar conflitos.</li>
</ul>
<pre><code>-- Desativa a verificacao de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 0;
-- Limpa as tabelas transacionais
TRUNCATE TABLE `item_evidences`, `inspection_checklist_items`, `inspections`, `user_roles`, `users`;
-- Reativa a verificacao
SET FOREIGN_KEY_CHECKS = 1;</code></pre>

<hr>

<h2 id="arquitetura-dados">🏛️ Arquitetura e Dicionário de Dados</h2>

<h3 id="mer">Modelo de Entidade-Relacionamento (MER)</h3>
<p>O diagrama a seguir ilustra a estrutura das tabelas e seus relacionamentos.</p>
<blockquote>
    <strong>Nota:</strong> O código abaixo é Mermaid. Se não for renderizado corretamente no seu visualizador, você pode
    usar um editor online como o <a href="https://mermaid.live/" target="_blank">Mermaid Live Editor</a> para colar o
    código e ver o diagrama.
</blockquote>
<br>

```mermaid
erDiagram
USERS {
    INT id PK
    VARCHAR full_name
    VARCHAR username "Unique - Login"
    VARCHAR email "Unique - Opcional"
    VARCHAR password_hash
    TINYINT is_active
    VARCHAR signature_path
    TIMESTAMP created_at
    TIMESTAMP updated_at
}
ROLES {
    INT id PK
    VARCHAR name "Unique"
    TEXT description
    TIMESTAMP created_at
}
USER_ROLES {
    INT user_id PK
    INT role_id PK
}
INSPECTIONS {
    INT id PK
    INT inspector_id FK "Nullable"
    INT conferente_id FK "Nullable"
    INT gate_operator_id FK "Novo: Portaria"
    INT status_id FK
    VARCHAR entry_registration
    VARCHAR vehicle_plates
    VARCHAR transport_document
    INT modality_id FK
    INT operation_type_id FK
    INT unit_type_id FK
    INT container_type_id FK
    VARCHAR container_number
    TINYINT has_precinto "Novo: 0 ou 1"
    DECIMAL verified_length
    DECIMAL verified_width
    DECIMAL verified_height
    DATETIME start_datetime
    DATETIME inspection_started_at
    DATETIME end_datetime
    DATETIME conference_started_at
    DATETIME conference_ended_at
    DATETIME gate_out_at "Novo: Saída Física"
    VARCHAR driver_name
    VARCHAR driver_signature_path
    VARCHAR inspector_signature_path
    VARCHAR seal_shipper
    VARCHAR seal_rfb
    INT seal_verification_rfb_status_id FK
    INT seal_verification_shipper_status_id FK
    INT seal_verification_tape_status_id FK
    VARCHAR seal_verification_responsible_name
    VARCHAR seal_verification_signature_path
    DATE seal_verification_date
    TEXT observations
    TEXT action_taken
    VARCHAR generated_pdf_path
    TIMESTAMP created_at
    TIMESTAMP updated_at
}
INSPECTION_SEALS {
    INT id PK
    INT inspection_id FK
    VARCHAR seal_number
    INT stage_id FK
    VARCHAR photo_path
    INT verification_status_id FK "Novo: Portaria"
    TIMESTAMP created_at
}
INSPECTION_IMAGES {
    INT id PK
    INT inspection_id FK
    INT category_id FK
    VARCHAR photo_path
    TEXT description
    TIMESTAMP created_at
}
INSPECTION_CHECKLIST_ITEMS {
    INT id PK
    INT inspection_id FK
    INT master_point_id FK
    INT status_id FK
    TEXT observations
    TIMESTAMP created_at
    TIMESTAMP updated_at
}
ITEM_EVIDENCES {
    INT id PK
    INT item_id FK
    VARCHAR file_path
    VARCHAR file_name
    INT file_size
    VARCHAR mime_type
    TIMESTAMP created_at
}
MASTER_INSPECTION_POINTS {
    INT id PK
    INT point_number "Unique"
    VARCHAR name
    TEXT description
    VARCHAR category
}
LOOKUP_STATUSES { INT id PK VARCHAR name "Unique" }
LOOKUP_MODALITIES { INT id PK VARCHAR name "Unique" }
LOOKUP_OPERATION_TYPES { INT id PK VARCHAR name "Unique" }
LOOKUP_UNIT_TYPES { INT id PK VARCHAR name "Unique" }
LOOKUP_CONTAINER_TYPES { INT id PK VARCHAR name "Unique" }
LOOKUP_CHECKLIST_ITEM_STATUSES { INT id PK VARCHAR name "Unique" }
LOOKUP_SEAL_VERIFICATION_STATUSES { INT id PK VARCHAR name "Unique" }
LOOKUP_SEAL_STAGES { INT id PK VARCHAR name "Unique" }
LOOKUP_IMAGE_CATEGORIES { INT id PK VARCHAR name "Unique" }
%% Relacionamentos de Autenticacao
USERS ||--o{ USER_ROLES : "possui"
ROLES ||--o{ USER_ROLES : "atribuído"
USERS ||--o{ INSPECTIONS : "inspeciona"
USERS ||--o{ INSPECTIONS : "confere"
USERS ||--o{ INSPECTIONS : "libera_saida"
%% Relacionamentos principais e Evidencias
INSPECTIONS ||--o{ INSPECTION_CHECKLIST_ITEMS : "contém"
INSPECTION_CHECKLIST_ITEMS ||--o{ ITEM_EVIDENCES : "tem"
INSPECTIONS ||--o{ INSPECTION_SEALS : "possui lacres"
INSPECTIONS ||--o{ INSPECTION_IMAGES : "possui fotos"
MASTER_INSPECTION_POINTS ||--o{ INSPECTION_CHECKLIST_ITEMS : "define"
%% Relacionamentos com lookups
LOOKUP_STATUSES ||--o{ INSPECTIONS : "status"
LOOKUP_MODALITIES ||--o{ INSPECTIONS : "modalidade"
LOOKUP_OPERATION_TYPES ||--o{ INSPECTIONS : "tipo_operação"
LOOKUP_UNIT_TYPES ||--o{ INSPECTIONS : "tipo_unidade"
LOOKUP_CONTAINER_TYPES ||--o{ INSPECTIONS : "tipo_container"
LOOKUP_SEAL_VERIFICATION_STATUSES ||--o{ INSPECTIONS : "status_lacre_geral"
LOOKUP_CHECKLIST_ITEM_STATUSES ||--o{ INSPECTION_CHECKLIST_ITEMS : "status_item"
%% Novos Relacionamentos
LOOKUP_SEAL_STAGES ||--o{ INSPECTION_SEALS : "define etapa"
LOOKUP_IMAGE_CATEGORIES ||--o{ INSPECTION_IMAGES : "define categoria"
```

<h2 id="dicionario-de-dados-completo">📖 Dicionário de Dados Completo</h2>
<p>A seguir, uma descrição detalhada de cada tabela e das suas respetivas colunas.</p>

<h3>Tabelas de Autenticação e Acesso (RBAC)</h3>
<p>Estas tabelas formam o sistema de Controle de Acesso Baseado em Funções (Role-Based Access Control).</p>

<h4><strong><code>users</code></strong></h4>
<p>Tabela central para armazenamento de usuários do sistema.</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Nome da Coluna</th>
            <th align="left">Tipo de Dado</th>
            <th align="left">Chave</th>
            <th align="left">Nulo?</th>
            <th align="left">Descrição / Regra de Negócio</th>
            <th align="left">Exemplo</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>id</code></td>
            <td>INT</td>
            <td>PK</td>
            <td>Não</td>
            <td>Identificador único do usuário.</td>
            <td><code>1</code></td>
        </tr>
        <tr>
            <td><code>full_name</code></td>
            <td>VARCHAR(255)</td>
            <td></td>
            <td>Não</td>
            <td>Nome completo do usuário.</td>
            <td><code>"Carlos Inspetor"</code></td>
        </tr>
        <tr>
            <td><code>username</code></td>
            <td>VARCHAR(50)</td>
            <td>UNIQUE</td>
            <td>Não</td>
            <td>Login principal do usuário.</td>
            <td><code>"cinspetor"</code></td>
        </tr>
        <tr>
            <td><code>email</code></td>
            <td>VARCHAR(255)</td>
            <td>UNIQUE</td>
            <td>Sim</td>
            <td>Email opcional. Se preenchido, deve ser único.</td>
            <td><code>"inspetor@uaga.com.br"</code></td>
        </tr>
        <tr>
            <td><code>password_hash</code></td>
            <td>VARCHAR(255)</td>
            <td></td>
            <td>Não</td>
            <td>Hash da senha (bcrypt).</td>
            <td><code>"$2y$..."</code></td>
        </tr>
        <tr>
            <td><code>is_active</code></td>
            <td>TINYINT(1)</td>
            <td></td>
            <td>Não</td>
            <td>Status do usuário (1=Ativo, 0=Inativo).</td>
            <td><code>1</code></td>
        </tr>
        <tr>
            <td><code>signature_path</code></td>
            <td>VARCHAR(512)</td>
            <td></td>
            <td>Sim</td>
            <td>Caminho da imagem da assinatura pessoal do usuário.</td>
            <td><code>"/signatures/user_1.png"</code></td>
        </tr>
    </tbody>
</table>

<h4><strong><code>roles</code></strong></h4>
<p>Define as funções (perfis) de usuário no sistema.</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Nome da Coluna</th>
            <th align="left">Tipo de Dado</th>
            <th align="left">Chave</th>
            <th align="left">Nulo?</th>
            <th align="left">Descrição</th>
            <th align="left">Exemplo</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>id</code></td>
            <td>INT</td>
            <td>PK</td>
            <td>Não</td>
            <td>Identificador único da função.</td>
            <td><code>3</code></td>
        </tr>
        <tr>
            <td><code>name</code></td>
            <td>VARCHAR(50)</td>
            <td>UNIQUE</td>
            <td>Não</td>
            <td>Nome único da função (ex: ADMIN, CONFERENTE).</td>
            <td><code>"INSPECTOR"</code></td>
        </tr>
    </tbody>
</table>

<h4><strong><code>user_roles</code></strong></h4>
<p>Tabela de junção para associar usuários a funções (relação N:M).</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Nome da Coluna</th>
            <th align="left">Tipo de Dado</th>
            <th align="left">Chave</th>
            <th align="left">Nulo?</th>
            <th align="left">Descrição</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>user_id</code></td>
            <td>INT</td>
            <td>PK, FK</td>
            <td>Não</td>
            <td>Ref. <code>users</code>.</td>
        </tr>
        <tr>
            <td><code>role_id</code></td>
            <td>INT</td>
            <td>PK, FK</td>
            <td>Não</td>
            <td>Ref. <code>roles</code>.</td>
        </tr>
    </tbody>
</table>

<hr>

<h3>Tabelas de Lookup (Mestras)</h3>
<p>Contêm valores estáticos para garantir consistência em toda a aplicação.</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Tabela</th>
            <th align="left">Descrição</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>lookup_statuses</code></td>
            <td>Estados da inspeção (ex: AGUARDANDO_INSPECAO, EM_CONFERENCIA, CORRECAO_DOCUMENTAL).</td>
        </tr>
        <tr>
            <td><code>lookup_modalities</code></td>
            <td>Modalidades (RODOVIARIO, MARITIMO, AEREO).</td>
        </tr>
        <tr>
            <td><code>lookup_operation_types</code></td>
            <td>Tipos de operação (VERDE, LARANJA, VERMELHA).</td>
        </tr>
        <tr>
            <td><code>lookup_unit_types</code></td>
            <td>Tipos de unidade (CONTAINER, BAU).</td>
        </tr>
        <tr>
            <td><code>lookup_container_types</code></td>
            <td>Tipos de container (DRY_20, REEFER_40).</td>
        </tr>
        <tr>
            <td><code>lookup_checklist_item_statuses</code></td>
            <td>Status do item (CONFORME, NAO_CONFORME).</td>
        </tr>
        <tr>
            <td><code>lookup_seal_verification_statuses</code></td>
            <td>Validação de lacres (OK, NAO_OK).</td>
        </tr>
        <tr>
            <td><code>lookup_seal_stages</code></td>
            <td>Etapas do lacre (INITIAL, FINAL, CONFERENCE, RFB, ARMADOR).</td>
        </tr>
        <tr>
            <td><code>lookup_image_categories</code></td>
            <td>Categorias de fotos (PLATE, PANORAMIC, PRECINTO_FRONT, etc.).</td>
        </tr>
    </tbody>
</table>

<hr>

<h3>Tabelas Principais</h3>

<h4><strong><code>master_inspection_points</code></strong></h4>
<p>Definição imutável dos 18 pontos de inspeção.</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Nome da Coluna</th>
            <th align="left">Tipo de Dado</th>
            <th align="left">Chave</th>
            <th align="left">Nulo?</th>
            <th align="left">Descrição</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>id</code></td>
            <td>INT</td>
            <td>PK</td>
            <td>Não</td>
            <td>ID do ponto.</td>
        </tr>
        <tr>
            <td><code>point_number</code></td>
            <td>INT</td>
            <td>UNIQUE</td>
            <td>Não</td>
            <td>Número oficial (1 a 18).</td>
        </tr>
        <tr>
            <td><code>name</code></td>
            <td>VARCHAR(255)</td>
            <td></td>
            <td>Não</td>
            <td>Nome do ponto.</td>
        </tr>
        <tr>
            <td><code>category</code></td>
            <td>VARCHAR(50)</td>
            <td></td>
            <td>Não</td>
            <td>Categoria ('VEICULO' ou 'CONTEINER').</td>
        </tr>
    </tbody>
</table>

<h4><strong><code>inspections</code></strong></h4>
<p>Tabela central que armazena o cabeçalho e o ciclo de vida da inspeção.</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Nome da Coluna</th>
            <th align="left">Tipo de Dado</th>
            <th align="left">Chave</th>
            <th align="left">Nulo?</th>
            <th align="left">Descrição / Regra de Negócio</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>id</code></td>
            <td>INT</td>
            <td>PK</td>
            <td>Não</td>
            <td>ID único da inspeção.</td>
        </tr>
        <tr>
            <td><code>inspector_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Sim</td>
            <td>Usuário Inspetor (Nulo até assumir a tarefa).</td>
        </tr>
        <tr>
            <td><code>conferente_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Sim</td>
            <td>Usuário Conferente (Nulo até assumir a tarefa).</td>
        </tr>
        <tr>
            <td><code>gate_operator_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Sim</td>
            <td>Usuário da Portaria que liberou a saída física.</td>
        </tr>
        <tr>
            <td><code>status_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>Status atual do processo (ref. <code>lookup_statuses</code>).</td>
        </tr>
        <tr>
            <td><code>entry_registration</code></td>
            <td>VARCHAR(100)</td>
            <td></td>
            <td>Não</td>
            <td>Registro de entrada (RE).</td>
        </tr>
        <tr>
            <td><code>vehicle_plates</code></td>
            <td>VARCHAR(20)</td>
            <td></td>
            <td>Não</td>
            <td>Placa do veículo.</td>
        </tr>
        <tr>
            <td><code>container_number</code></td>
            <td>VARCHAR(20)</td>
            <td></td>
            <td>Sim</td>
            <td>Número do container (se aplicável).</td>
        </tr>
        <tr>
            <td><code>has_precinto</code></td>
            <td>TINYINT(1)</td>
            <td></td>
            <td>Não</td>
            <td>Indica se a carga possui precinto/isca (1=Sim, 0=Não). Definido pelo Conferente.</td>
        </tr>
        <tr>
            <td><code>start_datetime</code></td>
            <td>DATETIME</td>
            <td></td>
            <td>Não</td>
            <td>Criação da inspeção pelo Documental.</td>
        </tr>
        <tr>
            <td><code>inspection_started_at</code></td>
            <td>DATETIME</td>
            <td></td>
            <td>Sim</td>
            <td>Início efetivo da inspeção (Checklist).</td>
        </tr>
        <tr>
            <td><code>end_datetime</code></td>
            <td>DATETIME</td>
            <td></td>
            <td>Sim</td>
            <td>Finalização da inspeção pelo Inspetor (Aprovado/Reprovado).</td>
        </tr>
        <tr>
            <td><code>conference_started_at</code></td>
            <td>DATETIME</td>
            <td></td>
            <td>Sim</td>
            <td>Início da conferência (Deslacre/Carga).</td>
        </tr>
        <tr>
            <td><code>conference_ended_at</code></td>
            <td>DATETIME</td>
            <td></td>
            <td>Sim</td>
            <td>Finalização total (Saída do Conferente).</td>
        </tr>
        <tr>
            <td><code>gate_out_at</code></td>
            <td>DATETIME</td>
            <td></td>
            <td>Sim</td>
            <td>Data/Hora da saída física do veículo (Registrado pela Portaria).</td>
        </tr>
        <tr>
            <td><code>seal_shipper</code></td>
            <td>VARCHAR(100)</td>
            <td></td>
            <td>Sim</td>
            <td>Lacre do Armador (entrada).</td>
        </tr>
        <tr>
            <td><code>seal_rfb</code></td>
            <td>VARCHAR(100)</td>
            <td></td>
            <td>Sim</td>
            <td>Lacre da RFB (entrada).</td>
        </tr>
        <tr>
            <td><code>generated_pdf_path</code></td>
            <td>VARCHAR(512)</td>
            <td></td>
            <td>Sim</td>
            <td>Link para o PDF final.</td>
        </tr>
    </tbody>
</table>

<h4><strong><code>inspection_seals</code></strong></h4>
<p>Tabela normalizada para armazenar múltiplos lacres em diferentes etapas (1:N).</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Nome da Coluna</th>
            <th align="left">Tipo de Dado</th>
            <th align="left">Chave</th>
            <th align="left">Nulo?</th>
            <th align="left">Descrição</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>id</code></td>
            <td>INT</td>
            <td>PK</td>
            <td>Não</td>
            <td>ID único do registro de lacre.</td>
        </tr>
        <tr>
            <td><code>inspection_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>Vínculo com a inspeção.</td>
        </tr>
        <tr>
            <td><code>seal_number</code></td>
            <td>VARCHAR(100)</td>
            <td></td>
            <td>Não</td>
            <td>Código do lacre lido/inserido.</td>
        </tr>
        <tr>
            <td><code>stage_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>Etapa (ref. <code>lookup_seal_stages</code>).</td>
        </tr>
        <tr>
            <td><code>photo_path</code></td>
            <td>VARCHAR(512)</td>
            <td></td>
            <td>Sim</td>
            <td>Foto evidência do lacre.</td>
        </tr>
        <tr>
            <td><code>verification_status_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Sim</td>
            <td>Validação individual na Portaria (OK/NOK).</td>
        </tr>
    </tbody>
</table>

<h4><strong><code>inspection_images</code></strong></h4>
<p>Tabela normalizada para armazenar fotos gerais da carga e veículo (1:N).</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Nome da Coluna</th>
            <th align="left">Tipo de Dado</th>
            <th align="left">Chave</th>
            <th align="left">Nulo?</th>
            <th align="left">Descrição</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>id</code></td>
            <td>INT</td>
            <td>PK</td>
            <td>Não</td>
            <td>ID único da imagem.</td>
        </tr>
        <tr>
            <td><code>inspection_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>Vínculo com a inspeção.</td>
        </tr>
        <tr>
            <td><code>category_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>Tipo (ref. <code>lookup_image_categories</code>).</td>
        </tr>
        <tr>
            <td><code>photo_path</code></td>
            <td>VARCHAR(512)</td>
            <td></td>
            <td>Não</td>
            <td>Caminho do arquivo.</td>
        </tr>
        <tr>
            <td><code>description</code></td>
            <td>TEXT</td>
            <td></td>
            <td>Sim</td>
            <td>Descrição opcional da imagem.</td>
        </tr>
    </tbody>
</table>

<h4><strong><code>inspection_checklist_items</code></strong></h4>
<p>Status de cada um dos 18 pontos do checklist.</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Nome da Coluna</th>
            <th align="left">Tipo de Dado</th>
            <th align="left">Chave</th>
            <th align="left">Nulo?</th>
            <th align="left">Descrição</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>id</code></td>
            <td>INT</td>
            <td>PK</td>
            <td>Não</td>
            <td>ID do item.</td>
        </tr>
        <tr>
            <td><code>inspection_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>Vínculo com a inspeção.</td>
        </tr>
        <tr>
            <td><code>master_point_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>Qual ponto está sendo avaliado (1-18).</td>
        </tr>
        <tr>
            <td><code>status_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>Conforme, Não Conforme ou N/A (ref. <code>lookup_checklist_item_statuses</code>).</td>
        </tr>
        <tr>
            <td><code>observations</code></td>
            <td>TEXT</td>
            <td></td>
            <td>Sim</td>
            <td>Observações do inspetor.</td>
        </tr>
    </tbody>
</table>

<h4><strong><code>item_evidences</code></strong></h4>
<p>Evidências (fotos) atreladas a um item específico do checklist (ex: foto de um pneu furado).</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Nome da Coluna</th>
            <th align="left">Tipo de Dado</th>
            <th align="left">Chave</th>
            <th align="left">Nulo?</th>
            <th align="left">Descrição</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>id</code></td>
            <td>INT</td>
            <td>PK</td>
            <td>Não</td>
            <td>ID da evidência.</td>
        </tr>
        <tr>
            <td><code>item_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>Vínculo com o item do checklist.</td>
        </tr>
        <tr>
            <td><code>file_path</code></td>
            <td>VARCHAR(512)</td>
            <td></td>
            <td>Não</td>
            <td>Caminho do arquivo.</td>
        </tr>
    </tbody>
</table>

<h2 id="fluxo-dados">🔄 Fluxo de Dados e Ciclo de Vida</h2>
<p>
    Esta seção descreve como os dados transitam pelo sistema, desde a criação da inspeção até o arquivamento na saída do veículo.
    O status da inspeção (<code>status_id</code>) atua como o cursor que move o processo entre os diferentes atores.
</p>

<h3>Máquina de Estados (State Machine)</h3>
<p>O diagrama abaixo ilustra todas as transições possíveis de status no banco de dados.</p>

```mermaid
stateDiagram-v2
    direction LR

    %% Atores e Estados Iniciais
    state "Criação (Documental)" as DocStart {
        [*] --> AGUARDANDO_INSPECAO: Insert Inicial
    }

    state "Inspeção Física (Inspetor)" as Insp {
        AGUARDANDO_INSPECAO --> EM_INSPECAO: Inspetor assume
        EM_INSPECAO --> APROVADO: Checklist OK
        EM_INSPECAO --> REPROVADO: Checklist NOK
        
        REPROVADO --> REPROVADO_POS_AVALIACAO: Doc confirma erro
        REPROVADO --> APROVADO_COM_RESSALVAS: Doc aceita risco
        
        APROVADO --> AGUARDANDO_LACRACAO: Auto-transição
        APROVADO_COM_RESSALVAS --> AGUARDANDO_LACRACAO: Auto-transição
        
        AGUARDANDO_LACRACAO --> AGUARDANDO_CONFERENCIA: Fotos/Lacres Iniciais
    }

    state "Conferência (Conferente)" as Conf {
        AGUARDANDO_CONFERENCIA --> EM_CONFERENCIA: Início Carregamento
        EM_CONFERENCIA --> CONFERENCIA_FINALIZADA: Fim Carregamento
    }

    state "Documental Final" as DocEnd {
        CONFERENCIA_FINALIZADA --> AGUARDANDO_SAIDA: Lacração Fiscal (RFB)
    }

    state "Portaria (Gate Out)" as Gate {
        AGUARDANDO_SAIDA --> CORRECAO_DOCUMENTAL: Dados Incorretos
        CORRECAO_DOCUMENTAL --> AGUARDANDO_SAIDA: Correção Realizada
        
        AGUARDANDO_SAIDA --> FINALIZADO: Saída Confirmada
        FINALIZADO --> [*]
    }
```

<h3>Detalhamento das Etapas de Persistência</h3>

<table border="1" style="border-collapse: collapse; width:100%;"> <thead> <tr> <th width="15%">Etapa / Ator</th> <th width="35%">Dados Criados/Alterados</th> <th width="50%">Descrição do Fluxo</th> </tr> </thead> <tbody> <tr> <td><strong>1. Criação</strong>


<em>(Documental)</em></td> <td> <ul> <li><code>inspections</code> (INSERT)</li> <li><code>start_datetime</code></li> </ul> </td> <td>O Documental cria o "cabeçalho" da inspeção com Placa, Container e Modalidade. O status nasce como <strong>AGUARDANDO_INSPECAO (4)</strong>.</td> </tr> <tr> <td><strong>2. Checklist</strong>


<em>(Inspetor)</em></td> <td> <ul> <li><code>inspection_started_at</code></li> <li><code>inspection_checklist_items</code></li> <li><code>item_evidences</code> (Fotos de Avarias)</li> <li><code>end_datetime</code> (Fim do Checklist)</li> </ul> </td> <td>O inspetor preenche os 18 pontos. Se tudo estiver OK, o sistema muda para <strong>APROVADO (2)</strong> e, imediatamente, para <strong>AGUARDANDO_LACRACAO (9)</strong>.</td> </tr> <tr> <td><strong>3. Lacração Inicial</strong>


<em>(Inspetor)</em></td> <td> <ul> <li><code>inspection_seals</code> (Stage: INITIAL)</li> <li><code>inspection_images</code> (Placa/Panorâmica)</li> </ul> </td> <td>O inspetor registra os lacres vazios e fotos obrigatórias. Ao salvar, o status muda para <strong>AGUARDANDO_CONFERENCIA (7)</strong>, tornando o item visível para o Conferente.</td> </tr> <tr> <td><strong>4. Conferência</strong>


<em>(Conferente)</em></td> <td> <ul> <li><code>conference_started_at</code></li> <li><code>has_precinto</code> (Flag Crítica)</li> <li><code>inspection_seals</code> (Stage: FINAL)</li> <li><code>inspection_images</code> (Precintos)</li> <li><code>conference_ended_at</code></li> </ul> </td> <td>O conferente inicia o carregamento. Ao finalizar, ele define se houve uso de Precinto Eletrônico (<code>has_precinto</code>). O status vai para <strong>CONFERENCIA_FINALIZADA (6)</strong>.</td> </tr> <tr> <td><strong>5. Lacração Fiscal</strong>


<em>(Documental)</em></td> <td> <ul> <li><code>inspection_seals</code> (Stage: RFB/ARMADOR)</li> </ul> </td> <td>O documental insere os lacres da Receita Federal e Armador. O status avança para <strong>AGUARDANDO_SAIDA (13)</strong>.</td> </tr> <tr> <td><strong>6. Saída (Gate Out)</strong>


<em>(Portaria)</em></td> <td> <ul> <li><code>gate_operator_id</code></li> <li><code>gate_out_at</code></li> <li><code>seal_verification_*</code> (Validação Grade)</li> <li><code>inspection_seals.verification_status_id</code></li> </ul> </td> <td>A portaria confere fisicamente os dados.


Se OK: status <strong>FINALIZADO (11)</strong> e gera PDF.


Se Erro: status <strong>CORRECAO_DOCUMENTAL (14)</strong> e volta para o Documental. </td> </tr> </tbody> </table>

<h3 id="decisoes-design">Decisões de Design (Normalização e Indexação)</h3>
<ul>
<li><strong>Normalização (3FN):</strong> O schema está na Terceira Forma Normal para eliminar redundância e garantir a consistência dos dados, principalmente através do uso intensivo de <strong>Tabelas de Lookup</strong> (<code>lookup_*</code>).</li>
<li><strong>Controle de Acesso (RBAC):</strong> Foi implementado um modelo padrão de <strong>Role-Based Access Control</strong> com as tabelas <code>users</code>, <code>roles</code>, e <code>user_roles</code>. Esta abordagem permite uma gestão de permissões flexível e escalável, alinhada com as diferentes "Jornadas de Usuário" da aplicação.</li>
<li><strong>Integridade Referencial:</strong> Todas as relações são reforçadas com chaves estrangeiras (<code>FK</code>), utilizando <code>ON DELETE CASCADE</code> onde apropriado (como em <code>user_roles</code>) para manter a consistência.</li>
<li><strong>Indexação:</strong> Índices foram criados em todas as colunas de chave estrangeira e em campos de busca comum (como <code>users.email</code>) para acelerar consultas e, crucialmente, para evitar <strong>table locks</strong> durante transações.</li>
<li><strong>Constraints de Unicidade:</strong> Foram aplicadas constraints <code>UNIQUE</code> em campos críticos como <code>users.email</code> e <code>roles.name</code> para garantir a integridade dos dados diretamente no nível do banco de dados.</li>
</ul>

<hr>

<h2 id="detalhes-implementacao">⚙️ Detalhes de Implementação</h2>
<p>
Esta seção contém informações sobre os artefatos técnicos e o racional por trás das escolhas de tecnologia.
</p>
<h3>Script de Inicialização (init.sql)</h3>
<p>
O arquivo <code>init.sql</code> contém os comandos DDL (<code>CREATE TABLE</code>) e DML (<code>INSERT</code>) para
criar o schema completo, incluindo as tabelas de autenticação, e popular as tabelas mestras e de lookup com dados iniciais (ex: perfis de acesso padrão e um usuário administrador).
</p>

<h3>Tecnologia e Racional</h3>
<p>
O <strong>MySQL 8.0</strong> foi escolhido por ser uma tecnologia robusta e já existente na infraestrutura da UAGA.
A aplicação utiliza o ORM <strong>TypeORM</strong>, o que a desacopla da tecnologia específica do banco, permitindo
futuras migrações com impacto mínimo.
</p>
