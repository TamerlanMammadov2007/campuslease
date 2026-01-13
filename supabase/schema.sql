create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  bio text,
  university text,
  grad_year text,
  lease_duration text,
  move_in_date date,
  property_types text[] default '{}'::text[],
  preferred_cities text[] default '{}'::text[],
  parking boolean default false,
  budget_min integer,
  budget_max integer,
  has_pets boolean default false,
  pet_type text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  address text not null,
  city text not null,
  price numeric not null,
  bedrooms integer not null,
  bathrooms integer not null,
  square_feet integer not null,
  type text not null,
  images text[] default '{}'::text[],
  amenities text[] default '{}'::text[],
  utilities_included boolean default false,
  pets_allowed boolean default false,
  parking_available boolean default false,
  furnished boolean default false,
  available_from date not null,
  available_until date,
  owner_id uuid not null references public.profiles on delete cascade,
  owner_name text not null,
  owner_email text not null,
  owner_phone text,
  status text not null,
  coordinates jsonb,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles on delete cascade,
  listing_id uuid not null references public.listings on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, listing_id)
);

create table if not exists public.compare_items (
  user_id uuid not null references public.profiles on delete cascade,
  listing_id uuid not null references public.listings on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, listing_id)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings on delete cascade,
  applicant_id uuid not null references public.profiles on delete cascade,
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text,
  message text,
  created_at timestamptz default now()
);

create table if not exists public.roommate_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles on delete cascade,
  name text not null,
  age integer not null,
  gender text not null,
  university text not null,
  major text not null,
  bio text,
  photo text,
  budget_min integer not null,
  budget_max integer not null,
  move_in_date date not null,
  preferred_locations text[] default '{}'::text[],
  sleep_schedule text not null,
  cleanliness text not null,
  noise text not null,
  guests text not null,
  smoking text not null,
  drinking text not null,
  pets text not null,
  study_habits text not null,
  social_level text not null,
  interests text[] default '{}'::text[],
  created_at timestamptz default now()
);

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.listings on delete set null,
  property_title text,
  user_a_id uuid not null references public.profiles on delete cascade,
  user_a_name text not null,
  user_a_email text not null,
  user_b_id uuid not null references public.profiles on delete cascade,
  user_b_name text not null,
  user_b_email text not null,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads on delete cascade,
  sender_id uuid not null references public.profiles on delete cascade,
  sender_name text not null,
  sender_email text not null,
  recipient_id uuid not null references public.profiles on delete cascade,
  recipient_name text not null,
  recipient_email text not null,
  content text not null,
  created_at timestamptz default now(),
  read boolean default false
);

create table if not exists public.admin_login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete set null,
  email text not null,
  event_type text not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.favorites enable row level security;
alter table public.compare_items enable row level security;
alter table public.applications enable row level security;
alter table public.roommate_profiles enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.admin_login_events enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can read profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admins can update profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "Listings are viewable by everyone"
  on public.listings for select
  using (true);

create policy "Listings are insertable by owner"
  on public.listings for insert
  with check (
    auth.uid() = owner_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Listings are updatable by owner"
  on public.listings for update
  using (
    auth.uid() = owner_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Listings are deletable by owner"
  on public.listings for delete
  using (
    auth.uid() = owner_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Favorites are readable by owner"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Favorites are insertable by owner"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Favorites are deletable by owner"
  on public.favorites for delete
  using (auth.uid() = user_id);

create policy "Compare items are readable by owner"
  on public.compare_items for select
  using (auth.uid() = user_id);

create policy "Compare items are insertable by owner"
  on public.compare_items for insert
  with check (auth.uid() = user_id);

create policy "Compare items are deletable by owner"
  on public.compare_items for delete
  using (auth.uid() = user_id);

create policy "Applications are insertable by applicant"
  on public.applications for insert
  with check (auth.uid() = applicant_id);

create policy "Applications are readable by applicant or owner"
  on public.applications for select
  using (
    auth.uid() = applicant_id
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Applications are deletable by applicant"
  on public.applications for delete
  using (auth.uid() = applicant_id);

create policy "Roommate profiles are viewable by everyone"
  on public.roommate_profiles for select
  using (true);

create policy "Roommate profiles are insertable by owner"
  on public.roommate_profiles for insert
  with check (auth.uid() = user_id);

create policy "Roommate profiles are updatable by owner"
  on public.roommate_profiles for update
  using (auth.uid() = user_id);

create policy "Roommate profiles are deletable by owner"
  on public.roommate_profiles for delete
  using (auth.uid() = user_id);

create policy "Threads are readable by participants"
  on public.threads for select
  using (
    auth.uid() = user_a_id
    or auth.uid() = user_b_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Threads are insertable by participants"
  on public.threads for insert
  with check (
    auth.uid() = user_a_id or auth.uid() = user_b_id
  );

create policy "Threads are deletable by participants"
  on public.threads for delete
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Messages are readable by thread participants"
  on public.messages for select
  using (
    exists (
      select 1 from public.threads t
      where t.id = thread_id
        and (t.user_a_id = auth.uid() or t.user_b_id = auth.uid())
    )
  );

create policy "Messages are readable by admins"
  on public.messages for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Messages are insertable by sender"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.threads t
      where t.id = thread_id
        and (t.user_a_id = auth.uid() or t.user_b_id = auth.uid())
    )
  );

create policy "Messages are updatable by recipient"
  on public.messages for update
  using (auth.uid() = recipient_id);

create policy "Admin login events are readable by admins"
  on public.admin_login_events for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Admin login events are insertable by admins"
  on public.admin_login_events for insert
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'New User'), new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Listing images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Listing images are uploadable by owner"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Listing images are deletable by owner"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
