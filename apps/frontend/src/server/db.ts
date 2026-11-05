import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

let cachedSupabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedSupabaseClient) {
    return cachedSupabaseClient;
  }

  const supabaseUrl = process.env['SUPABASE_URL'];
  const supabaseKey =
    process.env['SUPABASE_SERVICE_ROLE_KEY'] ??
    process.env['SUPABASE_ANON_KEY'];

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY environment variables.'
    );
  }

  cachedSupabaseClient = createClient(supabaseUrl, supabaseKey, {
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
      throw new Error(error?.message ?? 'Failed to upsert topic progress.');
    }

    const row = data as TopicProgressRow;
    return {
      topicId: row.topic_id,
      status: isStudyStatus(row.status) ? row.status : status,
      updatedAt: row.updated_at,
    };
  },
};
