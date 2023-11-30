import configuration from '~/configuration';
import getVectorStore from './vector-store';

import { OpenAI } from 'langchain/llms/openai';
import { Document as LangchanDocument } from 'langchain/document';

import { ContextualCompressionRetriever } from 'langchain/retrievers/contextual_compression';
import { PromptTemplate } from 'langchain/prompts';
import { RunnableSequence } from 'langchain/schema/runnable';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { ConsoleCallbackHandler } from 'langchain/callbacks';
import { EmbeddingsFilter } from 'langchain/retrievers/document_compressors/embeddings_filter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Database } from '~/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

const OPENAI_MODEL = 'gpt-3.5-turbo-16k';
const DEBUG = !configuration.production;

/**
 * Generates a reply from a conversation chain.
 *
 * @param {Object} params - The parameters for generating the reply.
 * @param {Array<Object>} params.messages - An array of messages in the conversation.
 * Each message contains a role ('assistant' or 'user') and content (string).
 *
 * @return {Promise<string>} A promise that resolves with the generated reply.
 */
export default async function generateReplyFromChain(params: {
  client: SupabaseClient<Database>;
  messages: Array<{
    role: 'assistant' | 'user';
    content: string;
  }>;
  filter?: UnknownObject
  siteName: string;
}) {
  const model = new OpenAI({
    temperature: 0,
    modelName: OPENAI_MODEL,
    callbacks: DEBUG ? [new ConsoleCallbackHandler()] : [],
  });

  const chain = await crateChain({
    client: params.client,
    model,
    questionPrompt: getPromptTemplate(params.siteName),
    filter: params.filter
  });

  const messages = [...params.messages];
  const latestMessage = messages.splice(-1)[0];

  const pairs = messages.reduce<string[][]>((acc, _, index, array) => {
    if (index % 2 === 0) {
      acc.push(array.slice(index, index + 2).map((el) => el.content));
    }

    return acc;
  }, []);

  const chatHistory = pairs.reduce((acc, curr) => {
    return formatChatHistory(curr[1], curr[0], acc);
  }, '');

  return chain.stream({
    chatHistory,
    question: latestMessage.content,
  });
}

function getPromptTemplate(siteName: string) {
  return PromptTemplate.fromTemplate(
    `You are a helpful and polite customer support assistant working for ${siteName}. You will reply on behalf of ${siteName} and customers will refer to you as ${siteName}.
    Use only CHAT HISTORY and the CONTEXT to answer in a helpful manner to the question. Do not make up answers, emails, links, not in CONTEXT. If you don't know the answer - reply "Sorry, I don\'t know how to help with that.".
Keep your replies short, compassionate and informative. Output in markdown.
  ----------------
  CONTEXT: {context}
  ----------------
  CHAT HISTORY: {chatHistory}
  ----------------
  QUESTION: {question}
  ----------------
  Response:`,
  );
}

async function getVectorStoreRetriever(
  client: SupabaseClient<Database>,
  filter?: UnknownObject,
) {
  const maxDocuments = Number(process.env.CHATBOT_MAX_DOCUMENTS ?? 2);

  const similarityThreshold = Number(
    process.env.CHATBOT_SIMILARITY_THRESHOLD ?? 0.8,
  );

  const baseCompressor = new EmbeddingsFilter({
    embeddings: new OpenAIEmbeddings(),
    k: maxDocuments,
    similarityThreshold,
  });

  const vectorStore = await getVectorStore(client);

  return new ContextualCompressionRetriever({
    baseCompressor,
    baseRetriever: vectorStore.asRetriever({
      filter,
    }),
  });
}

async function crateChain(params: {
  client: SupabaseClient<Database>;
  model: OpenAI;
  questionPrompt: PromptTemplate;
  filter?: UnknownObject;
}) {
  const { model, questionPrompt, client, filter } = params;
  const retriever = await getVectorStoreRetriever(client, filter);

  const serializeDocs = (docs: LangchanDocument[]) =>
    docs.map((doc) => doc.pageContent).join('\n\n');

  return RunnableSequence.from([
    {
      question: (input: { question: string }) => input.question,
      chatHistory: (input: { chatHistory?: string }) => input.chatHistory ?? '',
      context: async (input: { question: string; chatHistory?: string }) => {
        const relevantDocs = await retriever.getRelevantDocuments(
          input.question,
        );

        return serializeDocs(relevantDocs);
      },
    },
    questionPrompt,
    model,
    new StringOutputParser(),
  ]);
}

function formatChatHistory(
  human: string,
  ai: string,
  previousChatHistory?: string,
) {
  if (!human) {
    return `AI: ${ai}`;
  }

  const newInteraction = `Human: ${human}\nAI: ${ai}`;

  if (!previousChatHistory) {
    return newInteraction;
  }

  return `${previousChatHistory}\n\n${newInteraction}`;
}
