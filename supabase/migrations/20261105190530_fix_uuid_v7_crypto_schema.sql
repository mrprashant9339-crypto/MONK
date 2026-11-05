-- Supabase installs pgcrypto in the extensions schema. Qualify the random-byte
-- call because the UUID function intentionally uses a fixed search_path.
create or replace function public.uuid_v7()
returns uuid
language plpgsql
volatile
set search_path = public
as $$
declare
  unix_ts_ms bigint;
  value bytea;
begin
  unix_ts_ms := floor(extract(epoch from clock_timestamp()) * 1000)::bigint;
  value := extensions.gen_random_bytes(16);
  value := set_byte(value, 0, (unix_ts_ms >> 40) & 255);
  value := set_byte(value, 1, (unix_ts_ms >> 32) & 255);
  value := set_byte(value, 2, (unix_ts_ms >> 24) & 255);
  value := set_byte(value, 3, (unix_ts_ms >> 16) & 255);
  value := set_byte(value, 4, (unix_ts_ms >> 8) & 255);
  value := set_byte(value, 5, unix_ts_ms & 255);
  value := set_byte(value, 6, (get_byte(value, 6) & 15) | 112);
  value := set_byte(value, 8, (get_byte(value, 8) & 63) | 128);
  return encode(value, 'hex')::uuid;
end;
$$;
