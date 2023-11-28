import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Json } from '~/database.types';
import { CHATBOTS_TABLE, DOCUMENTS_TABLE } from '~/lib/db-tables';

type Client = SupabaseClient<Database>;

export function insertChatbot(
  client: Client,
  chatbot: {
    name: string;
    url: string;
    description?: string;
    organizationId: number;
  },
) {
  return client.from(CHATBOTS_TABLE).insert({
    name: chatbot.name,
    url: chatbot.url,
    description: chatbot.description,
    organization_id: chatbot.organizationId,
  });
}

export async function updateChatbot(
  client: Client,
  chatbot: {
    id: number;
    name: string;
    url: string;
    description: string | null;
  },
) {
  return client
    .from(CHATBOTS_TABLE)
    .update({
      name: chatbot.name,
      url: chatbot.url,
      description: chatbot.description,
    })
    .match({
      id: chatbot.id,
    });
}

export async function updateChatbotSettings(
  client: Client,
  chatbotId: number,
  settings: ChatbotSettings
) {
  return client
    .from(CHATBOTS_TABLE)
    .update({
      settings: settings as unknown as Json,
    })
    .match({
      id: chatbotId,
    });
}

export async function deleteDocument(client: Client, documentId: number) {
  return client.from(DOCUMENTS_TABLE).delete().match({
    id: documentId,
  });
}
