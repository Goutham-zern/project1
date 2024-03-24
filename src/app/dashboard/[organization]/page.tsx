import { redirect } from 'next/navigation';

interface Params {
  params: {
    organization: string;
  };
}

export default function Page({ params }: Params) {
  const serviceRoleKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;
  // redirect to chatbots page by default
  return redirect(`${params.organization}/chatbots`);
}
