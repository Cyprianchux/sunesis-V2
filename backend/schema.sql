-- Run this SQL in your Supabase project's SQL editor to create the required tables.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  role text not null default 'user',
  created_at timestamp with time zone default now()
);

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  creator text not null references users(username) on delete cascade,
  created_at timestamp with time zone default now()
);

create table if not exists slides (
  id serial primary key,
  topic text not null references topics(name) on delete cascade,
  title text,
  description text,
  media text,
  type text,
  creator text not null references users(username) on delete cascade,
  created_at timestamp with time zone default now()
);
