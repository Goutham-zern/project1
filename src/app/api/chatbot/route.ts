import { NextRequest, NextResponse } from 'next/server';
import getSupabaseRouteHandlerClient from '~/core/supabase/route-handler-client';
import { getChatbotSettings } from '~/lib/chatbots/queries';

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

  if (!chatbotId) {
    return new Response('Missing chatbot ID', { status: 400 });
  }

  const client = getSupabaseRouteHandlerClient({
    admin: true,
  });

  const { settings } = await getChatbotSettings(client, +chatbotId);

  return NextResponse.json(settings, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
}