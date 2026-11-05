import { describe, expect, it } from 'vitest';
import {
  ReviewPlanInputSchema,
  ReviewPlanOutputSchema,
  generateReviewPlanFlow,
} from './flows';

describe('ReviewPlanFlow Schemas and Flow', () => {
  describe('ReviewPlanInputSchema', () => {
    it('should validate valid accelerated topics input', () => {
      const valid = {
        acceleratedTopics: ['Arquitetura Transformer', 'Model Context Protocol'],
      };
      expect(() => ReviewPlanInputSchema.parse(valid)).not.toThrow();
    });

    it('should reject invalid input data', () => {
      const invalid = {
        acceleratedTopics: 'not-an-array',
      };
      expect(() => ReviewPlanInputSchema.parse(invalid)).toThrow();
    });
  });

  describe('ReviewPlanOutputSchema', () => {
    it('should validate a compliant review plan output object', () => {
      const compliant = {
        executiveSummary: 'Plano focado em construir projetos práticos para consolidação.',
        estimatedTotalWeeks: 4,
        roadmap: [
          {
            topic: 'Model Context Protocol - MCP',
            recommendedProject: 'Criar um servidor MCP conectando Postgres ao Claude',
            estimatedHours: 8,
            priority: 'Alta' as const,
          },
        ],
      };

      const parsed = ReviewPlanOutputSchema.parse(compliant);
      expect(parsed.estimatedTotalWeeks).toBe(4);
      expect(parsed.roadmap[0].priority).toBe('Alta');
    });

    it('should reject invalid priority values', () => {
      const invalid = {
        executiveSummary: 'Sumário',
        estimatedTotalWeeks: 2,
        roadmap: [
          {
            topic: 'MCP',
            recommendedProject: 'Projeto',
            estimatedHours: 5,
            priority: 'Urgente', // Not 'Alta' | 'Média' | 'Baixa'
          },
        ],
      };

      expect(() => ReviewPlanOutputSchema.parse(invalid)).toThrow();
    });
  });

  describe('generateReviewPlanFlow execution', () => {
    it('should return empty roadmap without calling LLM when acceleratedTopics is empty', async () => {
      const result = await generateReviewPlanFlow({
        acceleratedTopics: [],
      });

      expect(result.estimatedTotalWeeks).toBe(0);
      expect(result.roadmap).toEqual([]);
      expect(result.executiveSummary).toContain('Nenhum tópico acelerado');
    });
  });
});
