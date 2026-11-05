import { describe, expect, it, vi } from 'vitest';
import { Request, Response } from 'express';
import { handleGeneratePlan } from './server';
import { ReviewPlanOutput } from './flows';

function createMockResponse() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

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
    const req = { body: { acceleratedTopics: 'invalid-string' } } as unknown as Request;
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
    const mockFlowRunner = vi.fn().mockRejectedValue(new Error('Quota limit reached'));
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
