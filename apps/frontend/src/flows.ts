import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import type {
  ReviewPlanInput,
  ReviewPlanOutput,
  ReviewRoadmapItem,
} from '@ia-study-hub/shared-types';

export const ReviewRoadmapItemSchema = z.object({
  topic: z.string(),
  recommendedProject: z.string(),
  estimatedHours: z.number(),
  priority: z.enum(['Alta', 'Média', 'Baixa']),
});

export const ReviewPlanInputSchema = z.object({
  acceleratedTopics: z
    .array(z.string())
    .describe('Lista de matérias concluídas em ritmo acelerado'),
});

export const ReviewPlanOutputSchema = z.object({
  executiveSummary: z.string(),
  estimatedTotalWeeks: z.number(),
  roadmap: z.array(ReviewRoadmapItemSchema),
});

export type { ReviewPlanInput, ReviewPlanOutput, ReviewRoadmapItem };

export const ai = genkit({
  plugins: [googleAI()],
  model: 'gemini-2.5-flash',
});

export const generateReviewPlanFlow = ai.defineFlow(
  {
    name: 'generateReviewPlanFlow',
    inputSchema: ReviewPlanInputSchema,
    outputSchema: ReviewPlanOutputSchema,
  },
  async (input: ReviewPlanInput): Promise<ReviewPlanOutput> => {
    if (!input.acceleratedTopics || input.acceleratedTopics.length === 0) {
      return {
        executiveSummary:
          'Nenhum tópico acelerado foi selecionado. Todos os tópicos da formação já estão em estudo aprofundado ou aguardando início.',
        estimatedTotalWeeks: 0,
        roadmap: [],
      };
    }

    const promptText = `
Você é um Tech Lead e Mentor Sênior especialista em Engenharia de IA Aplicada.

OBJETIVO:
O usuário concluiu a certificação do curso e marcou os tópicos abaixo como "Acelerado (para a prova)".
Agora, ele deseja entrar no "Modo Vitalício": aprofundar de verdade seus conhecimentos com projetos práticos e mão na massa para atingir maestria real no mercado de trabalho.

TÓPICOS ACELERADOS PARA REVISÃO:
${input.acceleratedTopics.map((topic, index) => `${index + 1}. ${topic}`).join('\n')}

INSTRUÇÕES:
1. Crie um Sumário Executivo encorajador e estratégico (executiveSummary).
2. Estime a quantidade total de semanas (estimatedTotalWeeks) para completar essa trilha de revisão de forma sustentável (dedicando cerca de 6 a 10 horas semanais).
3. Para cada tópico, defina:
   - topic: nome exato do tópico recebido.
   - recommendedProject: um projeto prático e desafiador para portfólio que consolide esse conhecimento no mundo real.
   - estimatedHours: carga horária prática estimada (em horas) para concluir o projeto.
   - priority: nível de relevância para o mercado de IA ('Alta', 'Média' ou 'Baixa').
`;

    const response = await ai.generate({
      prompt: promptText,
      output: {
        schema: ReviewPlanOutputSchema,
      },
    });

    const output = response.output;
    if (!output) {
      throw new Error('Falha na geração do plano de revisão pelo modelo.');
    }

    return output;
  }
);
