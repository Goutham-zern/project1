create extension vector with schema extensions;

create type jobs_status as ENUM (
  'pending',
  'running',
  'completed',
  'failed'
);

create table chatbots (
  id bigint generated by default as identity primary key,
  name text not null,
  description text,
  url text not null,
  settings jsonb default '{
    "title": "AI Assistant",
    "branding": {
      "textColor": "#fff",
      "primaryColor": "#0a0a0a",
      "accentColor": "#0a0a0a"
    },
    "position": "bottom-right"
  }' not null,
  organization_id bigint not null references public.organizations on delete cascade,
  created_at timestamptz default now() not null
);

create table documents (
  id bigint generated by default as identity primary key,
  embedding vector (1536),
  content text not null,
  metadata jsonb default '{}' not null,
  created_at timestamptz default now() not null
);

create table conversations (
  id bigint generated by default as identity primary key,
  chatbot_id bigint not null references public.chatbots on delete cascade,
  created_at timestamptz default now() not null
);

create table messages (
  id bigint generated by default as identity primary key,
  conversation_id bigint not null references public.conversations on delete cascade,
  text text not null,
  sender text not null,
  created_at timestamptz default now() not null
);

create table jobs (
  id bigint generated always as identity primary key,
  uuid uuid not null unique default gen_random_uuid(),
  chatbot_id bigint not null references public.chatbots on delete cascade,
  organization_id bigint not null references public.organizations,
  status jobs_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  tasks_count int not null default 0,
  tasks_completed_count int not null default 0,
  tasks_succeeded_count int not null default 0,

  unique (organization_id, id)
);

create table notifications (
  id bigint generated always as identity primary key,
  organization_id bigint not null references public.organizations on delete cascade,
  body text not null,
  link text,
  entity_id text not null,
  entity_type text not null,
  read bool not null default false,
  created_at timestamptz not null default now()
);

create table plans (
  name text not null,
  product_id text not null,
  task_quota int not null,
  board_quota int not null,
  primary key (product_id)
);

alter table chatbots enable row level security;
alter table documents enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table jobs enable row level security;
alter table notifications enable row level security;
alter table plans enable row level security;

alter publication supabase_realtime add table notifications;

create function match_documents (
  query_embedding vector(1536),
  match_count int DEFAULT null,
  filter jsonb DEFAULT '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

create function kw_match_documents(query_text text, match_count int)
returns table (id bigint, content text, metadata jsonb, similarity real)
as $$

begin
return query execute
format('select id, content, metadata, ts_rank(to_tsvector(content), plainto_tsquery($1)) as similarity
from documents
where to_tsvector(content) @@ plainto_tsquery($1)
order by similarity desc
limit $2')
using query_text, match_count;
end;
$$ language plpgsql;

create index on documents using ivfflat (embedding vector_cosine_ops)
with
  (lists = 100);

create policy "Users can read Chatbots in their Organization"
  on chatbots
  for select
  to authenticated
  using (
    current_user_is_member_of_organization(organization_id)
  );

create policy "Users can insert Chatbots in their Organization"
  on chatbots
  for insert
  to authenticated
  with check (
    current_user_is_member_of_organization(organization_id)
);

create policy "Users can update Chatbots in their Organization"
  on chatbots
  for update
  to authenticated
  using (
    current_user_is_member_of_organization(organization_id)
  ) with check (
    current_user_is_member_of_organization(organization_id)
  );

create policy "Users can select jobs in their Organization"
  on jobs
  for select
  to authenticated
  using (
    current_user_is_member_of_organization(organization_id)
  );

create policy "Users can insert jobs in their Organization"
  on jobs
  for insert
  to authenticated
  with check (
    current_user_is_member_of_organization(organization_id)
  );

create policy "Users can select documents in their Organization"
  on documents
  for select
  to authenticated
  using (
    current_user_is_member_of_organization((metadata ->> 'organization_id')::int)
  );

create policy "Users can update documents in their Organization"
  on documents
  for update
  to authenticated
  using (
    current_user_is_member_of_organization((metadata ->> 'organization_id')::int)
  ) with check (
    current_user_is_member_of_organization((metadata ->> 'organization_id')::int)
  );

create policy "Users can delete documents in their Organization"
  on documents
  for delete
  to authenticated
  using (
    current_user_is_member_of_organization((metadata ->> 'organization_id')::int)
  );
