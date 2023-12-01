export function getConversationCookieName() {
  return process.env.CONVERSATION_ID_STORAGE_KEY || `__makerchat_conversation_id`;
}