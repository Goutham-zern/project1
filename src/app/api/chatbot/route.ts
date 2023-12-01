import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';

import getSupabaseRouteHandlerClient from '~/core/supabase/route-handler-client';
import { getChatbotSettings } from '~/lib/chatbots/queries';
import { getConversationCookieName } from '~/lib/chatbots/conversion-cookie-name';
import configuration from '~/configuration';

const CONVERSATION_ID_STORAGE_KEY = getConversationCookieName();

export async function GET(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const chatbotId = req.nextUrl.searchParams.get('id');
  const conversationId = req.cookies.get(CONVERSATION_ID_STORAGE_KEY);

  if (!chatbotId) {
    return new Response('Missing chatbot ID', { status: 400 });
  }

  const client = getSupabaseRouteHandlerClient({
    admin: true,
  });

  const { settings, siteName } = await getChatbotSettings(client, chatbotId);

  // if there is no conversation ID, we generate one and store it in a cookie
  // so that we can keep track of the conversation
  if (!conversationId) {
    const conversationUid = nanoid(16);

    cookies().set(CONVERSATION_ID_STORAGE_KEY, conversationUid, {
      path: '/',
      httpOnly: true,
      secure: configuration.production,
    });
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
  };

  const payload = {
    settings,
    siteName,
  };

  return NextResponse.json(payload, {
    headers,
  });
}
