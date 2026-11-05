import { describe, expect, it, vi } from 'vitest';
import { Request, Response } from 'express';
import {
  handleGeneratePlan,
  handleGetProgress,
  handleUpsertProgress,
} from './server';
import { ReviewPlanOutput } from './flows';
import { ProgressRepository } from './server/db';

function createMockResponse() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

describe('Server Progress API Handlers', () => {
  describe('handleGetProgress', () => {
    it('should return 200 with progress records from repository', async () => {
      const mockRepo: ProgressRepository = {
        getAllProgress: vi.fn().mockResolvedValue([
          {
            topicId: 'mod-1-topic-1',
            status: 'deep_study',
            updatedAt: '2026-11-05T00:00:00.000Z',
          },
        ]),
        upsertProgress: vi.fn(),
      };
      const req = {} as Request;
      const res = createMockResponse();

      await handleGetProgress(req, res, mockRepo);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          topicId: 'mod-1-topic-1',
          status: 'deep_study',
          updatedAt: '2026-11-05T00:00:00.000Z',
        },
      ]);
    });

    it('should return 500 when repository throws an error', async () => {
      const mockRepo: ProgressRepository = {
        getAllProgress: vi
          .fn()
          .mockRejectedValue(new Error('Supabase connection error')),
        upsertProgress: vi.fn(),
      };
      const req = {} as Request;
      const res = createMockResponse();

      await handleGetProgress(req, res, mockRepo);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: 'Supabase connection error',
        })
      );
    });
  });

  describe('handleUpsertProgress', () => {
    it('should return 400 when topicId is missing or empty', async () => {
      const mockRepo: ProgressRepository = {
        getAllProgress: vi.fn(),
        upsertProgress: vi.fn(),
      };
      const req = { body: { topicId: '   ', status: 'deep_study' } } as Request;
      const res = createMockResponse();

      await handleUpsertProgress(req, res, mockRepo);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockRepo.upsertProgress).not.toHaveBeenCalled();
    });

    it('should return 400 when status is invalid', async () => {
      const mockRepo: ProgressRepository = {
        getAllProgress: vi.fn(),
        upsertProgress: vi.fn(),
      };
      const req = {
        body: { topicId: 'mod-1-topic-1', status: 'invalid_status' },
      } as Request;
      const res = createMockResponse();

      await handleUpsertProgress(req, res, mockRepo);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockRepo.upsertProgress).not.toHaveBeenCalled();
    });

    it('should return 200 with upserted record on valid payload', async () => {
      const updatedRecord = {
        topicId: 'mod-1-topic-1',
        status: 'accelerated' as const,
        updatedAt: '2026-11-05T00:00:00.000Z',
      };
      const mockRepo: ProgressRepository = {
        getAllProgress: vi.fn(),
        upsertProgress: vi.fn().mockResolvedValue(updatedRecord),
      };
      const req = {
        body: { topicId: 'mod-1-topic-1', status: 'accelerated' },
      } as Request;
      const res = createMockResponse();

      await handleUpsertProgress(req, res, mockRepo);

      expect(mockRepo.upsertProgress).toHaveBeenCalledWith(
        'mod-1-topic-1',
        'accelerated'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedRecord);
    });

    it('should return 500 when upsertProgress fails', async () => {
      const mockRepo: ProgressRepository = {
        getAllProgress: vi.fn(),
        upsertProgress: vi.fn().mockRejectedValue(new Error('DB write failed')),
      };
      const req = {
        body: { topicId: 'mod-1-topic-1', status: 'deep_study' },
      } as Request;
      const res = createMockResponse();

      await handleUpsertProgress(req, res, mockRepo);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: 'DB write failed',
        })
      );
    });
  });
});

describe('Server handleGeneratePlan', () => {
  it('should return 400 if acceleratedTopics is missing or null', async () => {
    const req = { body: {} } as Request;
    const res = createMockResponse();

    await handleGeneratePlan(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('acceleratedTopics'),
      })
    );
  });

  it('should return 400 if acceleratedTopics is an empty array', async () => {
    const req = { body: { acceleratedTopics: [] } } as Request;
    const res = createMockResponse();

    await handleGeneratePlan(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 if acceleratedTopics is not an array', async () => {
    const req = {
      body: { acceleratedTopics: 'invalid-string' },
    } as unknown as Request;
    const res = createMockResponse();

    await handleGeneratePlan(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 200 with generated plan on success', async () => {
    const mockOutput: ReviewPlanOutput = {
      executiveSummary: 'Plano aprovado com sucesso.',
      estimatedTotalWeeks: 4,
      roadmap: [
        {
          topic: 'Model Context Protocol - MCP',
          recommendedProject: 'Servidor MCP Customizado',
          estimatedHours: 8,
          priority: 'Alta',
        },
      ],
    };

    const mockFlowRunner = vi.fn().mockResolvedValue(mockOutput);
    const req = {
      body: { acceleratedTopics: ['Model Context Protocol - MCP'] },
    } as Request;
    const res = createMockResponse();

    await handleGeneratePlan(req, res, mockFlowRunner);

    expect(mockFlowRunner).toHaveBeenCalledWith({
      acceleratedTopics: ['Model Context Protocol - MCP'],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockOutput);
  });

  it('should return 500 when flowRunner throws an error', async () => {
    const mockFlowRunner = vi
      .fn()
      .mockRejectedValue(new Error('Quota limit reached'));
    const req = {
      body: { acceleratedTopics: ['Fine-Tuning com LoRA'] },
    } as Request;
    const res = createMockResponse();

    await handleGeneratePlan(req, res, mockFlowRunner);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Erro interno'),
        details: 'Quota limit reached',
      })
    );
  });
});
