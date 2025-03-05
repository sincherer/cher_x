create table if not exists public.messages (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null,
  text text not null,
  sender varchar(10) not null check (sender in ('user', 'ai')),
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.messages enable row level security;

-- Create policy to allow users to see only their own messages
drop policy if exists "Users can view their own messages" on public.messages;
create policy "Users can view their own messages"
  on public.messages for select
  using (auth.uid() = user_id);

-- Create policy to allow users to insert their own messages
drop policy if exists "Users can insert their own messages" on public.messages;
create policy "Users can insert their own messages"
  on public.messages for insert
  with check (auth.uid() = user_id);