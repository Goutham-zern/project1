'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import getSupabaseServerActionClient from '~/core/supabase/action-client';
import getLogger from '~/core/logger';
import Crawler from '~/core/crawler';

import { getChatbot } from '~/lib/chatbots/queries';
import { withSession } from '~/core/generic/actions-utils';
import ChatbotTaskQueue from '~/lib/chatbots/chatbot-task-queue';
import {
  deleteDocument,
  updateChatbotSettings,
} from '~/lib/chatbots/mutations';

export const getSitemapLinks = withSession(
  async (params: { chatbotId: number; csrfToken: string }) => {
    const client = getSupabaseServerActionClient();
    const logger = getLogger();
    const crawler = new Crawler();

    logger.info(
      {
        chatbotId: params.chatbotId,
      },
      `Getting sitemap links...`,
    );

    const chatbot = await getChatbot(client, params.chatbotId);
    const { sites } = await crawler.getSitemapLinks(chatbot.url);

    logger.info(
      {
        numberOfPages: sites.length,
      },
      `Sitemap links retrieved successfully.`,
    );

    return {
      numberOfPages: sites.length,
    };
  },
);

export const createChatbotCrawlingJob = withSession(
  async (params: { chatbotId: number; csrfToken: string }) => {
    const taskQueue = new ChatbotTaskQueue();
    const client = getSupabaseServerActionClient();

    await taskQueue.createJob(client, {
      chatbotId: params.chatbotId,
    });

    revalidatePath(
      `/dashboard/[organization]/chatbots/[chatbot]/training`,
      `page`,
    );

    return {
      success: true,
    };
  },
);

export const deleteDocumentAction = withSession(async (data: FormData) => {
  const client = getSupabaseServerActionClient();

  const documentId = z.coerce.number().parse(data.get('documentId'));
  await deleteDocument(client, documentId);

  revalidatePath(
    `/dashboard/[organization]/chatbots/[chatbot]/documents`,
    `page`,
  );
});

export const saveChatbotSettingsAction = withSession(
  async (
    prevState: Maybe<{
      success: boolean;
    }>,
    data: FormData,
  ) => {
    const { chatbotId, ...body } = z
      .object({
        title: z.string(),
        textColor: z.string(),
        primaryColor: z.string(),
        accentColor: z.string(),
        position: z.enum([`bottom-left`, `bottom-right`]),
        chatbotId: z.coerce.number(),
      })
      .parse(Object.fromEntries(data));

    const client = getSupabaseServerActionClient();

    const settings: ChatbotSettings = {
      title: body.title,
      position: body.position,
      branding: {
        textColor: body.textColor,
        primaryColor: body.primaryColor,
        accentColor: body.accentColor,
      },
    };

    const { error } = await updateChatbotSettings(client, chatbotId, settings);

    if (error) {
      return {
        success: false,
      };
    }

    revalidatePath(
      `/dashboard/[organization]/chatbots/[chatbot]/design`,
      `page`,
    );

    return {
      success: true,
    };
  },
);
