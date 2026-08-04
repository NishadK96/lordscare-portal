-- Store the Guild Bank command prefix per customer.
-- Existing and newly invited customers default to "!".

alter table public.profiles
  add column if not exists command_prefix text not null default '!'
  check (char_length(command_prefix) between 1 and 3 and command_prefix !~ '[[:space:]]');

update public.profiles
set command_prefix = '!'
where command_prefix is null or btrim(command_prefix) = '';
