import {
  CourseSubject,
  SubjectCatalogSpec,
  SubjectModule,
  SubmoduleItem,
} from '@ia-study-hub/shared-types';

export const SUBJECT_CATALOG_SPECS: readonly SubjectCatalogSpec[] = [
  {
    id: 's1',
    number: 1,
    title: 'Fundamentos de IA e LLMs para Programadores',
    moduleSubCounts: [2, 5, 7, 5, 4, 2, 2, 5, 3, 3],
    hasPodcast: true,
    hasEvaluation: true,
  },
  {
    id: 's2',
    number: 2,
    title: 'APIs de IA Generativa e Prompt Engineering',
    moduleSubCounts: [4, 5, 4, 4, 4, 6, 2, 3],
    hasPodcast: true,
    hasEvaluation: true,
  },
  {
    id: 's3',
    number: 3,
    title: 'Model Context Protocol - MCP',
    moduleSubCounts: [1, 6, 2, 2, 4, 5, 2, 1],
    hasPodcast: true,
    hasEvaluation: true,
  },
  {
    id: 's4',
    number: 4,
    title: 'Criação de Agentes Autônomos',
    moduleSubCounts: [5, 7, 4, 2, 2, 1, 1, 2, 1],
    hasPodcast: true,
    hasEvaluation: true,
  },
  {
    id: 's5',
    number: 5,
    title: 'Ferramentas de IA para UX e UI',
    moduleSubCounts: [6, 6, 5, 3, 5],
    hasPodcast: true,
    hasEvaluation: true,
  },
  {
    id: 's6',
    number: 6,
    title: 'Ferramentas de IA para DevOps',
    moduleSubCounts: [4, 3, 3, 3, 3, 3, 3, 4, 2, 2, 2, 3, 14],
    hasPodcast: true,
    hasEvaluation: true,
  },
  {
    id: 's7',
    number: 7,
    title: 'Ferramentas de IA para Gestão de projetos',
    moduleSubCounts: [3, 3, 2, 2, 2, 2, 2, 2, 2, 3],
    hasPodcast: true,
    hasEvaluation: true,
  },
  {
    id: 's8',
    number: 8,
    title: 'Arquitetura de Sistemas com IA',
    moduleSubCounts: [4, 5, 5, 5, 4],
    hasPodcast: true,
    hasEvaluation: true,
  },
  {
    id: 's9',
    number: 9,
    title: 'Processamento de Dados e Fine-Tuning de Modelos',
    moduleSubCounts: [3, 2, 5, 4, 4, 3],
    hasPodcast: true,
    hasEvaluation: true,
  },
  {
    id: 's10',
    number: 10,
    title: 'Segurança e Governança em IA',
    moduleSubCounts: [2, 2, 2, 2, 3, 3, 2, 3, 1],
    hasPodcast: false,
    hasEvaluation: true,
  },
  {
    id: 's11',
    number: 11,
    title: 'Projeto Integrador – Capstone Project',
    moduleSubCounts: [7, 6, 4, 4, 3],
    hasPodcast: true,
    hasEvaluation: true,
  },
  {
    id: 's12',
    number: 12,
    title: 'Carreira e Entrevistas para Engenheiros de AI Aplicada',
    moduleSubCounts: [],
    hasPodcast: false,
    hasEvaluation: false,
    isLocked: true,
    startDate: '14/11/2026',
  },
  {
    id: 's13',
    number: 13,
    title: '4ª Revolução Industrial e Tecnologias Emergentes',
    moduleSubCounts: [],
    hasPodcast: false,
    hasEvaluation: false,
    isLocked: true,
    startDate: '08/12/2026',
  },
  {
    id: 's14',
    number: 14,
    title: 'Foresight Estratégico',
    moduleSubCounts: [],
    hasPodcast: false,
    hasEvaluation: false,
    isLocked: true,
    startDate: '02/01/2027',
  },
  {
    id: 's15',
    number: 15,
    title: 'Ecossistema De Inovação',
    moduleSubCounts: [],
    hasPodcast: false,
    hasEvaluation: false,
    isLocked: true,
    startDate: '26/01/2027',
  },
];

export function buildSubjectTree(spec: SubjectCatalogSpec): CourseSubject {
  if (spec.isLocked) {
    return {
      id: spec.id,
      number: spec.number,
      title: spec.title,
      isLocked: true,
      startDate: spec.startDate,
      modules: [],
    };
  }

  const modules: SubjectModule[] = spec.moduleSubCounts.map(
    (subCount, moduleIndex) => {
      const moduleNumber = moduleIndex + 1;
      const submodules: SubmoduleItem[] = Array.from(
        { length: subCount },
        (_, subIndex) => {
          const subNumber = subIndex + 1;
          return {
            id: `${spec.id}-m${moduleNumber}-s${subNumber}`,
            title: `Submódulo ${moduleNumber}.${subNumber}`,
            status: 'pending' as const,
          };
        }
      );

      return {
        id: `${spec.id}-m${moduleNumber}`,
        moduleNumber,
        title: `Módulo ${moduleNumber}`,
        submodules,
      };
    }
  );

  const podcast: SubmoduleItem | undefined = spec.hasPodcast
    ? {
        id: `${spec.id}-podcast`,
        title: 'Podcast da Matéria',
        status: 'pending',
      }
    : undefined;

  const evaluation: SubmoduleItem | undefined = spec.hasEvaluation
    ? {
        id: `${spec.id}-avaliacao`,
        title: 'Avaliação / Prova do Módulo',
        status: 'pending',
      }
    : undefined;

  return {
    id: spec.id,
    number: spec.number,
    title: spec.title,
    isLocked: false,
    modules,
    ...(podcast ? { podcast } : {}),
    ...(evaluation ? { evaluation } : {}),
  };
}

export function buildInitialSyllabusTree(): CourseSubject[] {
  return SUBJECT_CATALOG_SPECS.map((spec) => buildSubjectTree(spec));
}

export const INITIAL_SUBJECTS: readonly CourseSubject[] =
  buildInitialSyllabusTree();
