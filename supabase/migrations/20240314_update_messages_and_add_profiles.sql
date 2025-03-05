-- Create user_profiles table
create table if not exists public.user_profiles (
  id uuid references auth.users(id) primary key,
  display_name text not null,
  email text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) for user_profiles
alter table public.user_profiles enable row level security;

-- Create policy to allow users to see their own profile
drop policy if exists "Users can view their own profile" on public.user_profiles;
create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

-- Create policy to allow users to update their own profile
drop policy if exists "Users can update their own profile" on public.user_profiles;
create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- Create policy to allow users to insert their own profile
drop policy if exists "Users can insert their own profile" on public.user_profiles;
create policy "Users can insert their own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- Create chat_sessions table to track conversation topics
create table if not exists public.chat_sessions (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null,
  topic_name text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) for chat_sessions
alter table public.chat_sessions enable row level security;

-- Create policy to allow users to see their own chat sessions
create policy "Users can view their own chat sessions"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

-- Create policy to allow users to insert their own chat sessions
create policy "Users can insert their own chat sessions"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

-- Create messages table with user information and chat session reference
create table if not exists public.messages (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null,
  chat_session_id bigint references public.chat_sessions(id) not null,
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