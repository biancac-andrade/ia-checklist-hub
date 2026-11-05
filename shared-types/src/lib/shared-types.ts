export type StudyStatus = 'pending' | 'deep_study' | 'accelerated' | 'review_later';

export const VALID_STUDY_STATUSES: readonly StudyStatus[] = [
  'pending',
  'deep_study',
  'accelerated',
  'review_later',
] as const;

export function isStudyStatus(value: unknown): value is StudyStatus {
  return (
    typeof value === 'string' &&
    (VALID_STUDY_STATUSES as readonly string[]).includes(value)
  );
}

export interface TopicProgressRecord {
  readonly topicId: string;
  readonly status: StudyStatus;
  readonly updatedAt?: string;
}

export interface UpdateTopicProgressPayload {
  readonly topicId: string;
  readonly status: StudyStatus;
}

export interface TopicItem {
  id: string;
  title: string;
  status: StudyStatus;
}

export interface CourseModule {
  id: number;
  title: string;
  topics: TopicItem[];
}

export interface SubmoduleItem {
  id: string;
  title: string;
  status: StudyStatus;
}

export interface SubjectModule {
  id: string;
  moduleNumber: number;
  title: string;
  submodules: SubmoduleItem[];
}

export interface SubjectCatalogSpec {
  id: string;
  number: number;
  title: string;
  moduleSubCounts: readonly number[];
  hasPodcast: boolean;
  hasEvaluation: boolean;
  isLocked?: boolean;
  startDate?: string;
}

export interface CourseSubject {
  id: string;
  number: number;
  title: string;
  isLocked: boolean;
  startDate?: string;
  modules: SubjectModule[];
  podcast?: SubmoduleItem;
  evaluation?: SubmoduleItem;
}

export interface StudyMetrics {
  total: number;
  deepStudy: number;
  accelerated: number;
  reviewLater: number;
  pending: number;
  certificateProgressPercent: number;
  realMasteryPercent: number;
}

export interface ReviewRoadmapItem {
  topic: string;
  recommendedProject: string;
  estimatedHours: number;
  priority: 'Alta' | 'Média' | 'Baixa';
}

export interface ReviewPlanInput {
  acceleratedTopics: string[];
}

export interface ReviewPlanOutput {
  executiveSummary: string;
  estimatedTotalWeeks: number;
  roadmap: ReviewRoadmapItem[];
}

export const INITIAL_SYLLABUS: CourseModule[] = [
  {
    id: 1,
    title: 'Fundamentos de IA e LLMs para Programadores',
    topics: [
      { id: 'mod-1-topic-1', title: 'História e contexto da IA', status: 'pending' },
      { id: 'mod-1-topic-2', title: 'Arquitetura Transformer e Mecanismos de Atenção', status: 'pending' },
      { id: 'mod-1-topic-3', title: 'Tokenização, Vocabulário e Representação de Texto', status: 'pending' },
      { id: 'mod-1-topic-4', title: 'Janela de Contexto e Limitações Computacionais', status: 'pending' },
      { id: 'mod-1-topic-5', title: 'Embeddings e Representações em Espaços Vetoriais', status: 'pending' },
      { id: 'mod-1-topic-6', title: 'Hiperparâmetros de Inferência: Temperatura, Top-P e Top-K', status: 'pending' },
      { id: 'mod-1-topic-7', title: 'Modelos Proprietários vs. Modelos Open Source', status: 'pending' },
      { id: 'mod-1-topic-8', title: 'Alucinações, Vieses e Comportamento Probabilístico', status: 'pending' },
      { id: 'mod-1-topic-9', title: 'Function Calling e Saídas Estruturadas', status: 'pending' },
      { id: 'mod-1-topic-10', title: 'Latência, Throttling e Custos de Inferência em Produção', status: 'pending' },
      { id: 'mod-1-topic-11', title: 'Setup de Ambiente e Ferramentas para Engenharia de IA', status: 'pending' },
    ],
  },
  {
    id: 2,
    title: 'APIs de IA Generativa e Prompt Engineering',
    topics: [
      { id: 'mod-2-topic-1', title: 'Integração com SDKs Oficiais e Model Providers', status: 'pending' },
      { id: 'mod-2-topic-2', title: 'Estruturação de System Instructions e Personas Especializadas', status: 'pending' },
      { id: 'mod-2-topic-3', title: 'Técnicas de Prompting: Zero-Shot, Few-Shot e Chain-of-Thought', status: 'pending' },
      { id: 'mod-2-topic-4', title: 'Structured Outputs com Schema Enforcement (Zod e JSON Schema)', status: 'pending' },
      { id: 'mod-2-topic-5', title: 'Streaming de Respostas e Manipulação Assíncrona de Eventos', status: 'pending' },
      { id: 'mod-2-topic-6', title: 'Estratégias de Cache de Prompts e Redução de Custos', status: 'pending' },
      { id: 'mod-2-topic-7', title: 'Tratamento de Erros, Rate Limiting e Fallbacks Resilientes', status: 'pending' },
    ],
  },
  {
    id: 3,
    title: 'Model Context Protocol - MCP',
    topics: [
      { id: 'mod-3-topic-1', title: 'Arquitetura e Especificação do Model Context Protocol', status: 'pending' },
      { id: 'mod-3-topic-2', title: 'Primitivas Fundamentais: Resources, Prompts e Tools', status: 'pending' },
      { id: 'mod-3-topic-3', title: 'Desenvolvimento de MCP Servers Customizados em TypeScript', status: 'pending' },
      { id: 'mod-3-topic-4', title: 'Conexão e Configuração de MCP Clients em IDEs e Agentes', status: 'pending' },
      { id: 'mod-3-topic-5', title: 'Segurança, Permissões e Sandboxing no MCP', status: 'pending' },
      { id: 'mod-3-topic-6', title: 'Integração de Bancos de Dados e Serviços Externos via MCP', status: 'pending' },
    ],
  },
  {
    id: 4,
    title: 'Criação de Agentes Autônomos',
    topics: [
      { id: 'mod-4-topic-1', title: 'Fundamentos de Agentes e Loops de Raciocínio ReAct', status: 'pending' },
      { id: 'mod-4-topic-2', title: 'Tool Calling e Execução de Ações Determinísticas', status: 'pending' },
      { id: 'mod-4-topic-3', title: 'Memória de Curto e Longo Prazo em Agentes', status: 'pending' },
      { id: 'mod-4-topic-4', title: 'Orquestração Multi-Agente e Delegação de Tarefas', status: 'pending' },
      { id: 'mod-4-topic-5', title: 'Planejamento Dinâmico e Decomposição de Metas Complexas', status: 'pending' },
      { id: 'mod-4-topic-6', title: 'Agentes Baseados em Código e Ambientes Sandbox', status: 'pending' },
      { id: 'mod-4-topic-7', title: 'Human-in-the-Loop e Mecanismos de Confirmação', status: 'pending' },
      { id: 'mod-4-topic-8', title: 'Frameworks Modernos de Agentes (Genkit, LangGraph, AutoGen)', status: 'pending' },
      { id: 'mod-4-topic-9', title: 'Observabilidade, Tracing e Depuração de Comportamento Agêntico', status: 'pending' },
    ],
  },
  {
    id: 5,
    title: 'Ferramentas de IA para UX & UI',
    topics: [
      { id: 'mod-5-topic-1', title: 'Prototipagem Acelerada e Geração de Interfaces com IA', status: 'pending' },
      { id: 'mod-5-topic-2', title: 'Design to Code: Do Figma para Componentes Funcionais', status: 'pending' },
      { id: 'mod-5-topic-3', title: 'Geração e Estilização de Telas com Tailwind CSS', status: 'pending' },
      { id: 'mod-5-topic-4', title: 'Auditoria de Acessibilidade (a11y) e Usabilidade com IA', status: 'pending' },
      { id: 'mod-5-topic-5', title: 'Design Systems e Consistência Visual com Modelos Generativos', status: 'pending' },
    ],
  },
  {
    id: 6,
    title: 'Ferramentas de IA para DevOps',
    topics: [
      { id: 'mod-6-topic-1', title: 'Assistentes de Código e Infraestrutura (Copilot, Cursor, Claude Code)', status: 'pending' },
      { id: 'mod-6-topic-2', title: 'Geração e Validação de Infraestrutura como Código (Terraform/Ansible)', status: 'pending' },
      { id: 'mod-6-topic-3', title: 'Criação e Otimização de Dockerfiles e Manifests Kubernetes', status: 'pending' },
      { id: 'mod-6-topic-4', title: 'Automação de Pipelines CI/CD Inteligentes com GitHub Actions', status: 'pending' },
      { id: 'mod-6-topic-5', title: 'Revisão Automática de Pull Requests com Análise Estática', status: 'pending' },
      { id: 'mod-6-topic-6', title: 'Diagnóstico e Resolução Automatizada de Falhas de Build', status: 'pending' },
      { id: 'mod-6-topic-7', title: 'Monitoramento e Análise Inteligente de Logs e Métricas', status: 'pending' },
      { id: 'mod-6-topic-8', title: 'Detecção e Correção de Vulnerabilidades de Segurança (SAST/DAST)', status: 'pending' },
      { id: 'mod-6-topic-9', title: 'Observabilidade Aumentada por IA com Tracing Distribuído', status: 'pending' },
      { id: 'mod-6-topic-10', title: 'Automação de Tarefas Operacionais e Runbooks com Scripts de IA', status: 'pending' },
      { id: 'mod-6-topic-11', title: 'FinOps para IA: Otimização de Custos e Alocação de Recursos', status: 'pending' },
      { id: 'mod-6-topic-12', title: 'Engenharia de Confiabilidade (SRE) com Diagnósticos Preditivos', status: 'pending' },
    ],
  },
  {
    id: 7,
    title: 'Ferramentas de IA para Gestão de Projetos',
    topics: [
      { id: 'mod-7-topic-1', title: 'Criação de Documentos de Especificação Técnica (PRDs) com IA', status: 'pending' },
      { id: 'mod-7-topic-2', title: 'Quebra de Épicos em Histórias de Usuário e Critérios de Aceite', status: 'pending' },
      { id: 'mod-7-topic-3', title: 'Estimativas de Esforço e Dimensionamento de Tarefas com LLMs', status: 'pending' },
      { id: 'mod-7-topic-4', title: 'Integração de IA com Ferramentas Ágeis (Jira, Linear e GitHub Projects)', status: 'pending' },
      { id: 'mod-7-topic-5', title: 'Automação de Atas, Transcrições e Action Items de Reuniões', status: 'pending' },
      { id: 'mod-7-topic-6', title: 'Relatórios Executivos de Status e Comunicação com Stakeholders', status: 'pending' },
    ],
  },
  {
    id: 8,
    title: 'Arquitetura de Sistemas com IA',
    topics: [
      { id: 'mod-8-topic-1', title: 'Padrões de Arquitetura AI-First e Microsserviços Inteligentes', status: 'pending' },
      { id: 'mod-8-topic-2', title: 'Arquiteturas RAG (Retrieval-Augmented Generation) Avançadas', status: 'pending' },
      { id: 'mod-8-topic-3', title: 'Bancos Vetoriais e Estratégias de Indexação Semântica', status: 'pending' },
      { id: 'mod-8-topic-4', title: 'Gateways de IA, Roteamento Semântico e Load Balancing', status: 'pending' },
      { id: 'mod-8-topic-5', title: 'Resiliência, Circuit Breakers e Caching para Chamadas de LLM', status: 'pending' },
    ],
  },
  {
    id: 9,
    title: 'Processamento de Dados e Fine-Tuning de Modelos',
    topics: [
      { id: 'mod-9-topic-1', title: 'Coleta, Limpeza e Curadoria de Datasets para IA', status: 'pending' },
      { id: 'mod-9-topic-2', title: 'Preparação de Dados em Formatos JSONL e Instruction-Tuning', status: 'pending' },
      { id: 'mod-9-topic-3', title: 'Técnicas de Fine-Tuning Eficiente (LoRA, QLoRA e PEFT)', status: 'pending' },
      { id: 'mod-9-topic-4', title: 'Avaliação de Modelos e Benchmarks de Desempenho e Acurácia', status: 'pending' },
      { id: 'mod-9-topic-5', title: 'Quantização de Modelos (GGUF, AWQ) e Execução On-Premise', status: 'pending' },
      { id: 'mod-9-topic-6', title: 'Deploy e Servidão de Modelos Customizados com vLLM e Ollama', status: 'pending' },
    ],
  },
  {
    id: 10,
    title: 'Governança, Capstone Project & Carreira',
    topics: [
      { id: 'mod-10-topic-1', title: 'Ética, Privacidade e Conformidade Legal (LGPD, GDPR, AI Act)', status: 'pending' },
      { id: 'mod-10-topic-2', title: 'Segurança em IA: Prevenção a Prompt Injection e Jailbreaking', status: 'pending' },
      { id: 'mod-10-topic-3', title: 'Planejamento e Arquitetura do Capstone Project Integrador', status: 'pending' },
      { id: 'mod-10-topic-4', title: 'Implementação End-to-End do Projeto de Conclusão Prático', status: 'pending' },
      { id: 'mod-10-topic-5', title: 'Posicionamento de Mercado e Portfólio de Engenharia de IA', status: 'pending' },
      { id: 'mod-10-topic-6', title: 'Preparação para Entrevistas Técnicas em Inteligência Artificial', status: 'pending' },
    ],
  },
];
