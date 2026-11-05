import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { Request, Response } from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ReviewPlanInput,
  ReviewPlanOutput,
} from '@ia-study-hub/shared-types';
import { generateReviewPlanFlow, ReviewPlanInputSchema } from './flows';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const server = express();

let angularAppInstance: AngularNodeAppEngine | undefined;
function getAngularApp(): AngularNodeAppEngine {
  return (angularAppInstance ??= new AngularNodeAppEngine());
}

server.use(express.json());

export async function handleGeneratePlan(
  req: Request,
  res: Response,
  flowRunner: (input: ReviewPlanInput) => Promise<ReviewPlanOutput> = generateReviewPlanFlow
): Promise<void> {
  const parseResult = ReviewPlanInputSchema.safeParse(req.body);

  if (!parseResult.success || parseResult.data.acceleratedTopics.length === 0) {
    res.status(400).json({
      error:
        'O campo "acceleratedTopics" é obrigatório e deve ser um array não vazio contendo os tópicos concluídos em ritmo acelerado.',
    });
    return;
  }

  try {
    const plan = await flowRunner(parseResult.data);
    res.status(200).json(plan);
  } catch (error) {
    console.error('Erro ao gerar plano de revisão com Genkit:', error);
    res.status(500).json({
      error: 'Erro interno ao processar a geração do plano de revisão.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

server.post('/api/generate-plan', (req: Request, res: Response): void => {
  void handleGeneratePlan(req, res);
});

server.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

server.use('/**', (req: Request, res: Response, next) => {
  getAngularApp()
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  const runningServer = server.listen(port, (error?: Error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
    if (process.env['NX_READY_SIGNAL_SOCKET']) {
      try {
        const load = new Function('s', 'return import(s)') as (
          s: string
        ) => Promise<{ emitReadySignal(server: unknown): boolean }>;
        void load('@nx/js/ready-signal').then((module) => {
          module.emitReadySignal(runningServer);
        });
      } catch {
        // Module not found or optional
      }
    }
  });
}

export const reqHandler = createNodeRequestHandler(server);
