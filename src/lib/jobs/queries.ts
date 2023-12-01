import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/database.types';
import { JOBS_TABLE } from '~/lib/db-tables';

type Client = SupabaseClient<Database>;

export async function getJobs(
  client: Client,
  chatbotId: string,
  params: {
    from: number;
    to: number;
  },
) {
  const startOffset = params.from;
  const endOffset = params.to;

  const { data, count, error } = await client
    .from(JOBS_TABLE)
    .select(
      `
      id,
      status,
      completedAt: completed_at,
      createdAt: created_at,
      tasksCount: tasks_count,
      tasksCompleted: tasks_completed_count,
      tasksSucceeded: tasks_succeeded_count
    `,
      {
        count: 'exact',
      },
    )
    .eq('chatbot_id', chatbotId)
    .range(startOffset, endOffset);

  if (error) {
    throw error;
  }

  return {
    data: data ?? [],
    count: count ?? 0,
  };
}

export function getJobById(client: Client, jobId: number) {
  return client
    .from(JOBS_TABLE)
    .select(
      `
      id,
      status,
      organizationId: organization_id,
      completedAt: completed_at,
      createdAt: created_at,
      tasksCount: tasks_count,
      tasksCompleted: tasks_completed_count,
      tasksSucceeded: tasks_succeeded_count
    `,
      {
        count: 'exact',
      },
    )
    .eq('id', jobId)
    .single();
}
