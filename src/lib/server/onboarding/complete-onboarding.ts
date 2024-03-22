import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/database.types';

interface Params {
  userId: string;
  organizationName: string;
  client: SupabaseClient<Database>;
}

/**
 * @name completeOnboarding
 * @description Handles the submission of the onboarding flow. By default,
 * we use the submission to create the Organization and the user record
 * associated with the User who signed up using its ID
 * @param organizationName
 * @param client
 */
async function completeOnboarding({ userId, organizationName, client }: Params) {
  return client
    .rpc('create_new_organization', {
      org_name: organizationName,
      create_user: true
      // user_id: userId
    })
    .single<string>();
}

export default completeOnboarding;
