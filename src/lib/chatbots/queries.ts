import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/database.types';
import { CHATBOTS_TABLE, DOCUMENTS_TABLE } from '~/lib/db-tables';

type Client = SupabaseClient<Database>;

export async function getChatbots(
  client: Client,
  organizationId: number
) {
  return client
    .from(CHATBOTS_TABLE)
    .select(`
      id,
      name,
      description,
      createdAt: created_at
    `)
    .eq('organization_id', organizationId);
}

export async function getChatbot(
  client: Client,
  chatbotId: number
) {
  const { data, error } = await client
    .from(CHATBOTS_TABLE)
    .select(`
      id,
      name,
      description,
      siteName: site_name,
      organizationId: organization_id,
      url,
      createdAt: created_at,
      settings
    `)
    .eq('id', chatbotId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getChatbotSettings(
  client: Client,
  chatbotId: number
) {
  const { data, error } = await client
    .from(CHATBOTS_TABLE)
    .select(`
      settings
    `)
    .eq('id', chatbotId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getChatbotDocuments(
  client: Client,
  chatbotId: number,
  params: {
    from: number;
    to: number;
    query?: string;
  }
) {
  let query = client
    .from(DOCUMENTS_TABLE)
    .select(`
      createdAt: created_at,
      id,
      metadata
    `, {
      count: 'exact'
    })
    .eq('metadata -> chatbot_id::int', chatbotId)
    .range(params.from, params.to);

  if (params.query) {
    query = query.textSearch('name', params.query);
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    data,
    count: count ?? 0
  };
}

export async function getDocumentById(
  client: Client,
  id: number
) {
  return client
    .from(DOCUMENTS_TABLE)
    .select<string, {
      id: number;
      createdAt: string;
      content: string;
      metadata: {
        chatbotId: number;
        hash: string;
        title: string;
        url: string;
      };
    }>(`
      id,
      createdAt: created_at,
      content,
      metadata
    `,)
    .eq('id', id)
    .single();
}

export async function getDocumentByHash(
  client: Client,
  params: {
    hash: string;
    chatbotId: number
  }
) {
  const query = client
    .from(DOCUMENTS_TABLE)
    .select(`id`, {
      head: true
    })
    .eq('metadata -> hash::text', params.hash)
    .eq('metadata -> chatbotId::int', params.chatbotId)
    .limit(1)
    .maybeSingle();

  const { data } = await query;

  return data;
}