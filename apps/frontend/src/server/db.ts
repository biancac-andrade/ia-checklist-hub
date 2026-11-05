import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  isStudyStatus,
  StudyStatus,
  TopicProgressRecord,
} from '@ia-study-hub/shared-types';

export interface TopicProgressRow {
  topic_id: string;
  status: string;
  updated_at: string;
}

export interface ProgressRepository {
  getAllProgress(): Promise<TopicProgressRecord[]>;
  upsertProgress(
    topicId: string,
    status: StudyStatus
  ): Promise<TopicProgressRecord>;
}

let envLoaded = false;
function ensureEnvLoaded(): void {
  if (envLoaded) {
    return;
  }
  envLoaded = true;

  if (typeof process.loadEnvFile === 'function') {
    const envPath = resolve(process.cwd(), '.env');
    if (existsSync(envPath)) {
      try {
        process.loadEnvFile(envPath);
      } catch {
        // Ignore if already loaded by host environment
      }
    }
  }
}

let cachedSupabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedSupabaseClient) {
    return cachedSupabaseClient;
  }

  ensureEnvLoaded();

  const supabaseUrl = process.env['SUPABASE_URL'];
  const supabaseSecretKey =
    process.env['SUPABASE_SECRET_KEY'] ??
    process.env['SUPABASE_SERVICE_ROLE_KEY'] ??
    process.env['SUPABASE_ANON_KEY'];

  if (!supabaseUrl || !supabaseSecretKey) {
    const errorMessage =
      '[Supabase] Variáveis de ambiente ausentes: defina SUPABASE_URL e SUPABASE_SECRET_KEY no arquivo .env ou no painel do provedor de hospedagem.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  cachedSupabaseClient = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedSupabaseClient;
}

export const supabaseProgressRepository: ProgressRepository = {
  async getAllProgress(): Promise<TopicProgressRecord[]> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('topic_progress')
      .select('topic_id, status, updated_at');

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as TopicProgressRow[];
    return rows
      .filter((row) => isStudyStatus(row.status))
      .map((row) => ({
        topicId: row.topic_id,
        status: row.status as StudyStatus,
        updatedAt: row.updated_at,
      }));
  },

  async upsertProgress(
    topicId: string,
    status: StudyStatus
  ): Promise<TopicProgressRecord> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('topic_progress')
      .upsert(
        {
          topic_id: topicId,
          status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'topic_id' }
      )
      .select('topic_id, status, updated_at')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Falha ao realizar upsert em topic_progress.');
    }

    const row = data as TopicProgressRow;
    return {
      topicId: row.topic_id,
      status: isStudyStatus(row.status) ? row.status : status,
      updatedAt: row.updated_at,
    };
  },
};
