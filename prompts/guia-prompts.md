# Guia Mestre: Checklist & Hub de Aceleração de Estudos de IA

**Arquitetura:** Monorepo Nx + Angular 21 (SSR & Signals) + Tailwind CSS + Google Genkit (Gemini Micro-BFF) + Cypress E2E + Deploy no Render  
**Identidade Visual:** Paleta Adobe Color (Coral, Lavanda, Azul Céu, Menta, Amarelo Pastel)  
**Tipografia:** Header: `Arima Madurai` | Body: `Mulish`  

---

## 1. Especificações de Produto & Requisitos de Negócio (PRD)

### 1.1 O Desafio
O estudante possui **acesso vitalício** ao conteúdo, mas precisa cumprir o **prazo rígido da instituição para a emissão do certificado**. Isso impõe uma estratégia de estudo em dois tempos:
1. **Fase de Aceleração (Curto Prazo):** Focar no essencial, assistir aulas em velocidade acelerada e realizar provas para garantir o certificado antes do encerramento do prazo.
2. **Fase de Aprofundamento (Longo Prazo):** Retornar aos módulos acelerados com calma, consolidando a prática e os laboratórios ao longo do tempo.

### 1.2 Regras de Negócio e Estados dos Tópicos
Cada item da ementa possui exatamente **1 estado ativo** entre quatro possibilidades:
* **`pending` (Não Iniciado):** Tópico ainda não abordado.
* **`deep_study` (Estudado a Fundo):** Conteúdo assistido com calma, com notas e exercícios práticos concluídos.
* **`accelerated` (Acelerado / Prova Feita):** Conteúdo concluído em modo sprint para aprovação nas avaliações do certificado.
* **`review_later` (Voltar com Calma):** Marcador explícito de dívida técnica de aprendizado para revisão no modo vitalício.

### 1.3 Identidade Visual & Design System
* **Tipografia:**
  * **Títulos & Cabeçalhos:** `'Arima Madurai', cursive / sans-serif`
  * **Texto Corrido, Tabelas e Botões:** `'Mulish', sans-serif`
* **Paleta de Cores (Adobe Color Theme):**
  * Coral Primário: `#FF9F82` (Acentos de ação, badges de destaque)
  * Lavanda / Roxo Suave: `#D085E8` (Identidade do hub e cabeçalhos de módulo)
  * Azul Céu Suave: `#9FCAFF` (Superfícies de apoio, filtros e métricas totais)
  * Verde Menta (`deep_study`): `#85E8A5` (Status: Estudado a Fundo)
  * Amarelo Pastel (`accelerated`): `#FFFA93` (Status: Acelerado / Prova)
  * Coral Alerta (`review_later`): `#FF9F82` (Status: Pendente de Retorno)
  * Fundos: `#FAF9F6` (Light Clean) e `#1E1B2E` (Dark Slate Lavanda)

---

## 2. Setup Automatizado (Comando Único)

Em vez de rodar comando por comando no terminal, você pode executar o bloco encadeado abaixo ou passar o prompt correspondente para o seu agente de IA:

### 2.1 One-Liner para Terminal (Bash / Zsh)
```bash
npx create-nx-workspace@latest ia-course-tracker --preset=apps --nxCloud=skip && \
cd ia-course-tracker && \
npm install -D @nx/angular @nx/js @nx/cypress tailwindcss postcss autoprefixer @types/uuid && \
npx nx g @nx/angular:application frontend --routing=true --style=css --standalone=true --ssr=true --strict=true && \
npx nx g @nx/js:library shared-types --buildable --unitTestRunner=none && \
npm install genkit @genkit-ai/google-genai zod uuid && \
npx nx g @nx/cypress:configuration --project=frontend && \
mkdir -p prompts
```

### 2.2 Prompt para Agente de IA Executar o Setup
```markdown
# PAPEL
Atue como Engenheiro DevOps e Front-End Sênior especialista em Nx Monorepo e Angular 21.

# OBJETIVO
Executar autonomamente no terminal a inicialização completa do workspace Nx, aplicações, bibliotecas e dependências do projeto.

# COMANDOS A EXECUTAR
1. Crie o workspace Nx:
   npx create-nx-workspace@latest ia-course-tracker --preset=apps --nxCloud=skip
2. Navegue até o diretório:
   cd ia-course-tracker
3. Instale as devDependencies de ferramental e estilo:
   npm install -D @nx/angular @nx/js @nx/cypress tailwindcss postcss autoprefixer @types/uuid
4. Gere a aplicação Angular 21 Standalone com SSR habilitado:
   npx nx g @nx/angular:application frontend --routing=true --style=css --standalone=true --ssr=true --strict=true
5. Gere a biblioteca compartilhada de tipagens e contratos:
   npx nx g @nx/js:library shared-types --buildable --unitTestRunner=none
6. Instale as dependências de IA e runtime:
   npm install genkit @genkit-ai/google-genai zod uuid
7. Configure o Cypress para a aplicação frontend:
   npx nx g @nx/cypress:configuration --project=frontend
8. Crie a pasta `prompts/` na raiz do monorepo para guardar as System Instructions.
```

---

## 3. Configuração de Ferramentas de IA (MCPs)

Adicione ao seu `.cursor/mcp.json` ou arquivo equivalente da IDE:
```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    },
    "nx-mcp": {
      "command": "npx",
      "args": ["-y", "@nx/mcp-server"]
    }
  }
}
```

---

## 4. Caderno de Prompts Estruturados

### Prompt 1: Configuração do Tailwind CSS e Fontes Personalizadas
```markdown
# PAPEL
Atue como Engenheiro Front-End Especialista em Tailwind CSS e Angular 21.

# OBJETIVO
Configurar a tipografia do Google Fonts ('Arima Madurai' e 'Mulish') e estender o Tailwind CSS com a paleta de cores personalizada.

# DIRETRIZES
1. No arquivo `apps/frontend/src/index.html`, adicione a importação do Google Fonts no `<head>`:
   - Arima Madurai (pesos 500, 700)
   - Mulish (pesos 400, 600, 700)
2. No arquivo `tailwind.config.js` na raiz do projeto:
   - Configure o `content` para cobrir:
     `["./apps/frontend/src/**/*.{html,ts}", "./libs/**/*.{html,ts}"]`
   - Estenda o tema (`theme.extend`) com a paleta exata:
     - `brand-coral`: '#FF9F82'
     - `brand-lavender`: '#D085E8'
     - `brand-sky`: '#9FCAFF'
     - `brand-mint`: '#85E8A5'
     - `brand-yellow`: '#FFFA93'
     - `brand-dark`: '#1E1B2E'
     - `brand-surface`: '#28233D'
   - Configure as famílias de fonte no `fontFamily`:
     - `header`: ['"Arima Madurai"', 'cursive', 'sans-serif'],
     - `body`: ['"Mulish"', 'sans-serif'],
3. No arquivo `apps/frontend/src/styles.css`:
   - Insira as diretivas:
     @tailwind base;
     @tailwind components;
     @tailwind utilities;
   - Aplique no `body` a classe `font-body bg-[#FAF9F6] text-[#2D3748] antialiased`.
```

### Prompt 2: Contrato de Dados da Ementa (`shared-types`)
```markdown
# PAPEL
Atue como Arquiteto de Software TypeScript.

# OBJETIVO
Definir os modelos de dados e a matriz completa da ementa do curso em `libs/shared-types/src/lib/shared-types.ts`.

# ESPECIFICAÇÕES TÉCNICAS
1. Crie o tipo de status de estudo:
   `export type StudyStatus = 'pending' | 'deep_study' | 'accelerated' | 'review_later';`
2. Crie a interface `TopicItem`:
   - `id`: string;
   - `title`: string;
   - `status`: StudyStatus;
3. Crie a interface `CourseModule`:
   - `id`: number;
   - `title`: string;
   - `topics`: TopicItem[];
4. Crie a interface `StudyMetrics`:
   - `total`: number;
   - `deepStudy`: number;
   - `accelerated`: number;
   - `reviewLater`: number;
   - `pending`: number;
   - `certificateProgressPercent`: number;
   - `realMasteryPercent`: number;
5. Exporte a constante `INITIAL_SYLLABUS: CourseModule[]` contendo os 10 blocos da ementa oficial:
   - 1. Fundamentos de IA e LLMs para Programadores (11 tópicos)
   - 2. APIs de IA Generativa e Prompt Engineering (7 tópicos)
   - 3. Model Context Protocol - MCP (6 tópicos)
   - 4. Criação de Agentes Autônomos (9 tópicos)
   - 5. Ferramentas de IA para UX & UI (5 tópicos)
   - 6. Ferramentas de IA para DevOps (12 tópicos)
   - 7. Ferramentas de IA para Gestão de Projetos (6 tópicos)
   - 8. Arquitetura de Sistemas com IA (5 tópicos)
   - 9. Processamento de Dados e Fine-Tuning de Modelos (6 tópicos)
   - 10. Governança, Capstone Project & Carreira (6 tópicos)
6. Exporte todos os tipos no `index.ts` da biblioteca.
```

### Prompt 3: Serviço Reativo com Signals e SSR Safe Storage
```markdown
# PAPEL
Atue como Engenheiro Front-End Especialista em Angular 21.

# OBJETIVO
Implementar o serviço reativo `apps/frontend/src/app/services/syllabus.service.ts` para controle de estado e métricas.

# DIRETRIZES
1. Injete `PLATFORM_ID` com `inject(PLATFORM_ID)` e use `isPlatformBrowser` para garantir que o `localStorage` seja acessado apenas no cliente (evitando falhas em SSR).
2. Defina o Signal do estado principal:
   `readonly modules = signal<CourseModule[]>(INITIAL_SYLLABUS);`
3. Crie Signals computados (`computed`):
   - `metrics`: calcula `total`, `deepStudy`, `accelerated`, `reviewLater`, `pending`, `certificateProgressPercent` e `realMasteryPercent`.
   - `acceleratedTopicsList`: lista contendo o título de todos os tópicos com status `'accelerated'`.
   - `reviewLaterList`: lista contendo o título de todos os tópicos com status `'review_later'`.
4. Métodos:
   - `setStatus(topicId: string, status: StudyStatus)`: altera o status. Se o status já for o selecionado, reseta para `'pending'`.
   - `saveToStorage()`: grava no `localStorage` a cada alteração.
   - `loadFromStorage()`: recupera os dados persistidos no boot do cliente.
   - `reset()`: restaura o estado padrão inicial.
```

### Prompt 4: UI da Checklist com Tailwind CSS e Acessibilidade (A11y)
```markdown
# PAPEL
Atue como Engenheiro Front-End Sênior especialista em Angular 21 e Tailwind CSS.

# OBJETIVO
Criar o componente Standalone `ChecklistComponent` integrando o `SyllabusService` com design responsivo e acessível.

# DIRETRIZES DE DESIGN E UI (Tailwind)
1. Header:
   - Título principal com a fonte `font-header` na cor `text-brand-dark` e subtítulo informativo.
   - Painel de Métricas (Dashboard):
     - Card 1 (Azul Céu `bg-brand-sky/20 border-brand-sky`): Progresso do Certificado (`certificateProgressPercent`%).
     - Card 2 (Verde Menta `bg-brand-mint/20 border-brand-mint`): Estudado a Fundo (`deepStudy` itens).
     - Card 3 (Amarelo Pastel `bg-brand-yellow/30 border-brand-yellow`): Acelerado p/ Prova (`accelerated` itens).
     - Card 4 (Coral `bg-brand-coral/20 border-brand-coral`): Dívida p/ Modo Vitalício (`reviewLater` itens).
2. Seções dos Módulos:
   - Cada módulo em um card estilizado com bordas arredondadas (`rounded-2xl`), sombra sutil e cabeçalho com destaque em `bg-brand-lavender/15`.
   - Título do módulo com `font-header text-xl font-bold text-gray-800`.
3. Tabela / Lista de Itens:
   - Renderização moderna com a sintaxe `@for (module of modules(); track module.id)` e `@for (topic of module.topics; track topic.id)`.
   - Cada linha deve exibir o título do tópico e três botões/chips de seleção mútua com Tailwind:
     - Chip Verde Menta: "Estudado a Fundo"
     - Chip Amarelo Pastel: "Acelerado (Prova)"
     - Chip Coral: "Voltar com Calma"
   - Use atributos WAI-ARIA: `role="group"`, `aria-pressed`, `aria-label` descritivos.
   - O item ativo recebe visual preenchido com borda contrastante e escala suave (`scale-105 transition-all`).
```

### Prompt 5: Fluxo de IA com Google Genkit para Plano de Revisão (`flows.ts`)
```markdown
# PAPEL
Atue como Engenheiro de IA especialista em Google Genkit e TypeScript.

# OBJETIVO
Criar o fluxo `apps/frontend/src/flows.ts` para gerar automaticamente uma trilha de revisão pós-certificado a partir dos tópicos acelerados.

# ESPECIFICAÇÕES
1. Importe `genkit` e `z` de `genkit`, e o plugin `googleAI` de `@genkit-ai/google-genai`.
2. Inicialize o Genkit configurando o modelo `gemini-2.5-flash`.
3. Defina os Schemas com Zod:
   - `ReviewPlanInputSchema`:
     `{ acceleratedTopics: z.array(z.string()).describe("Lista de matérias concluídas em ritmo acelerado") }`
   - `ReviewPlanOutputSchema`:
     `{ executiveSummary: z.string(), estimatedTotalWeeks: z.number(), roadmap: z.array(z.object({ topic: z.string(), recommendedProject: z.string(), estimatedHours: z.number(), priority: z.enum(['Alta', 'Média', 'Baixa']) })) }`
4. Crie e exporte o fluxo `generateReviewPlanFlow`:
   - Persona: Tech Lead e Mentor de IA Aplicada.
   - Objetivo: Elaborar um cronograma de estudo aprofundado para quem garantiu o certificado e agora quer dominar os tópicos no modo vitalício.
   - Garanta que o output obedeça estritamente ao schema JSON definido.
```

### Prompt 6: Micro-BFF no `server.ts` do Angular SSR
```markdown
# PAPEL
Atue como Engenheiro Full-Stack Node.js e Angular SSR.

# OBJETIVO
Configurar o `apps/frontend/server.ts` para servir o SSR do Angular e hospedar a rota de API do Genkit.

# DIRETRIZES
1. Adicione `server.use(express.json());` logo após criar a instância do Express.
2. Registre a rota POST `/api/generate-plan` antes dos handlers de rota SSR do Angular:
   - Valide se `req.body.acceleratedTopics` existe e é um array. Caso esteja vazio, retorne status 400.
   - Invoque `generateReviewPlanFlow({ acceleratedTopics: req.body.acceleratedTopics })`.
   - Retorne o resultado com status 200 em JSON. Em caso de erro, retorne status 500 com o log de erro.
3. Assegure que as rotas estáticas (`server.get('**', express.static(...))`) e o `commonEngine.render(...)` continuem ativos para SSR.
```

### Prompt 7: Testes E2E com Cypress
```markdown
# PAPEL
Atue como Especialista em Testes E2E com Cypress.

# OBJETIVO
Criar o arquivo `apps/frontend-e2e/src/e2e/checklist.cy.ts` para validar o fluxo crítico da aplicação.

# CENÁRIOS
1. Carregamento e Estado Inicial:
   - Visitar a rota `/`.
   - Verificar a renderização do título com a fonte correta.
   - Validar que os contadores de métricas iniciam zerados (0% de progresso).
2. Seleção de Status e Atualização Visual:
   - Clicar no chip "Acelerado (Prova)" do tópico "História e contexto da IA".
   - Validar que o chip recebe a classe de destaque correspondente (`brand-yellow`).
   - Verificar se o contador de "Acelerado" foi incrementado para 1.
   - Clicar em "Estudado a Fundo" no mesmo item e validar que a seleção anterior foi substituída.
3. Persistência de Dados:
   - Recarregar a página com `cy.reload()`.
   - Garantir que o estado marcado permanece salvo via `localStorage`.
```

### Prompt 8: Configuração de Deploy em Serviço Único no Render
```markdown
# PAPEL
Atue como Engenheiro DevOps especialista em Render e Node.js.

# OBJETIVO
Configurar o deploy contínuo em um único Web Service no Render compilando Front-end SSR e Back-end integrados.

# CONFIGURAÇÕES
1. Tipo de Serviço: Web Service
2. Build Command:
   npm install && npx nx build frontend --configuration=production
3. Start Command:
   node dist/apps/frontend/server/server.mjs
4. Variáveis de Ambiente no painel do Render:
   - NODE_ENV: production
   - PORT: 10000
   - GEMINI_API_KEY: (sua chave de API do Google AI Studio)
5. Crie o arquivo `render.yaml` na raiz do repositório para deploy declarativo via Blueprint.
```

---

## 5. Arquitetura de Código, Clean Code & Governança de Projeto

Use este prompt como **System Instruction / Regra de Ouro** para qualquer geração de código ou refatoração no monorepo:

### Prompt 9: Guardião de Arquitetura Limpa, Clean Code e Tipagem Estrita
```markdown
# PAPEL
Atue como Staff Software Engineer e Arquiteto de Software TypeScript/Angular especialista em Clean Architecture e Design Patterns.

# OBJETIVO
Garantir que todo o código produzido no monorepo respeite rigorosamente os princípios de Clean Code, separação estrita de responsabilidades, tipagem forte e ausência de comentários ou abstrações desnecessárias.

# 1. ESTRUTURA DE PASTAS E RESPONSABILIDADES
Todo arquivo deve habitar estritamente sua pasta funcional correspondente dentro de `apps/frontend/src/app/`:
- `core/`: Configurações de inicialização, interceptors HTTP e guards globais.
- `shared/`: Componentes visuais atômicos/reutilizáveis (botões, badges, modais), pipes e diretivas genéricas.
- `features/`: Módulos de domínio autocontidos (ex.: `features/checklist/`, `features/ai-planner/`). Cada feature contém seus próprios componentes de visualização (`components/`) e sua página principal.
- `services/`: Serviços reativos de dados, estado e integração externa (`*.service.ts`).
- `libs/shared-types/`: Contratos de domínio puros, DTOs, interfaces e schemas Zod. Nenhum componente ou template Angular deve residir aqui.

# 2. NOMENCLATURA E CONVENÇÕES
- Arquivos em kebab-case com sufixo explícito de tipo: `checklist-card.component.ts`, `syllabus.service.ts`, `study-status.type.ts`.
- Componentes e Classes em PascalCase: `ChecklistCardComponent`, `SyllabusService`.
- Constantes e enums em UPPER_SNAKE_CASE: `INITIAL_SYLLABUS`.
- Nomes descritivos e autoexplicativos: evite abreviações crípticas (`accTop` -> `acceleratedTopics`, `mod` -> `courseModule`).

# 3. REGRAS DE CLEAN CODE E COMENTÁRIOS (CRÍTICO)
- PROIBIDO comentários óbvios ou que explicam sintaxe (ex: `// inicializa o array`, `// método que salva`).
- O código DEVE ser autoexplicativo por meio de nomenclatura limpa de variáveis e funções curtas (máximo 25-30 linhas por método).
- Comentários são tolerados APENAS para explicar decisões não intuitivas de arquitetura ou workarounds documentados de bibliotecas.
- Funções com responsabilidade única (Single Responsibility Principle).

# 4. REGRAS ESTRITAS DE TYPESCRIPT (STRICT MODE)
- PROIBIDO uso de `any` ou type casting cego (`as unknown as T`).
- Toda assinatura de função pública DEVE ter tipo explícito nos parâmetros e no retorno.
- Preferir tipos imutáveis (`readonly`, `ReadonlyArray`) sempre que o dado representar apenas leitura.
- Para checagem de tipos em tempo de execução, utilize esquemas Zod nos pontos de entrada de API (BFF).

# 5. PADRÕES DE TESTES UNITÁRIOS (JEST)
- Cada arquivo de lógica (`.service.ts`, `.util.ts`) DEVE ter seu arquivo de teste espelhado ao lado (`*.spec.ts`).
- Estrutura clara no padrão AAA (Arrange, Act, Assert).
- Proibido testes com asserções genéricas (`expect(true).toBe(true)`). Cada teste valida um único comportamento de negócio ou edge case.
- Mocks devem ser isolados e declarados no topo de cada suite de teste (`describe`).

# FORMATO DE SAÍDA
Gere apenas os arquivos definitivos necessários, sem classes órfãs, sem arquivos temporários e sem comentários redundantes.
```

---

## 6. Arquivo de Infraestrutura Declarativa (`render.yaml`)

```yaml
services:
  - type: web
    name: ia-checklist-hub
    env: node
    plan: free
    region: ohio
    buildCommand: npm install && npx nx build frontend --configuration=production
    startCommand: node dist/apps/frontend/server/server.mjs
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: GEMINI_API_KEY
        sync: false
```