-- ============================================================
-- Migracija: inicijalna šema (ensembles, members, staff,
-- rehearsals, attendance, costume_items, resource_assignments,
-- notifications)
-- ============================================================

-- ---------- ENUM TIPOVI ----------

create type member_status as enum ('aktivan', 'neaktivan', 'suspendovan');
create type attendance_status as enum ('prisutan', 'odsutan', 'opravdano_odsutan');
create type costume_status as enum ('dostupno', 'zaduzeno', 'na_popravci', 'van_upotrebe');
create type assignment_status as enum ('zaduzeno', 'vraceno');
create type staff_role as enum ('admin', 'rukovodilac', 'garderober');
create type gender_type as enum ('musko', 'zensko', 'unisex');

-- ---------- ENSEMBLES ----------

create table ensembles (
  id uuid primary key default gen_random_uuid(),
  ensemble_name text not null,
  created_at timestamptz not null default now()
);

-- ---------- MEMBERS (igrači — mobilna app, sopstveni login) ----------

create table members (
  id uuid primary key references auth.users(id) on delete cascade,
  member_name text not null,
  member_surname text not null,
  date_of_birth date,
  place_of_birth text,
  citizen_id text,
  residence text,
  passport_no text,
  profession text,
  phone_number text,
  admission_date date not null default current_date,
  termination_date date,
  status member_status not null default 'aktivan',
  status_date date not null default current_date,
  category text,
  ensemble_id uuid references ensembles(id),
  created_at timestamptz not null default now()
);

create index idx_members_ensemble on members(ensemble_id);

-- ---------- STAFF (admin / rukovodilac / garderober — web app, sopstveni login) ----------

create table staff (
  id uuid primary key references auth.users(id) on delete cascade,
  user_name text not null,
  user_surname text not null,
  user_role staff_role not null,
  created_at timestamptz not null default now()
);

-- ---------- REHEARSALS ----------

create table rehearsals (
  id uuid primary key default gen_random_uuid(),
  ensemble_id uuid not null references ensembles(id),
  rehearsal_datetime timestamptz not null,
  rehearsal_location text,
  created_by uuid references staff(id),
  created_at timestamptz not null default now()
);

create index idx_rehearsals_ensemble on rehearsals(ensemble_id);
create index idx_rehearsals_datetime on rehearsals(rehearsal_datetime);

-- ---------- ATTENDANCE (spaja members <-> rehearsals) ----------

create table attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  rehearsal_id uuid not null references rehearsals(id) on delete cascade,
  attendance_status attendance_status not null,
  absence_reason text,
  recorded_by uuid references staff(id),
  recorded_at timestamptz not null default now(),
  unique (member_id, rehearsal_id)
);

create index idx_attendance_member on attendance(member_id);
create index idx_attendance_rehearsal on attendance(rehearsal_id);

-- ---------- COSTUME_ITEMS (fundus) ----------

create table costume_items (
  id uuid primary key default gen_random_uuid(),
  costume_item_name text not null,
  gender gender_type,
  region text,
  status costume_status not null default 'dostupno',
  created_at timestamptz not null default now()
);

-- ---------- RESOURCE_ASSIGNMENTS (zaduženja kostima) ----------

create table resource_assignments (
  id uuid primary key default gen_random_uuid(),
  costume_item_id uuid not null references costume_items(id),
  member_id uuid not null references members(id) on delete cascade,
  assigned_by uuid references staff(id),
  borrow_date date not null default current_date,
  return_date date,
  status assignment_status not null default 'zaduzeno',
  created_at timestamptz not null default now()
);

create index idx_assignments_member on resource_assignments(member_id);
create index idx_assignments_costume_item on resource_assignments(costume_item_id);

-- ---------- NOTIFICATIONS ----------

create table notifications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  notification_subject text not null,
  notification_text text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_member on notifications(member_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Pošto je "Enable automatic RLS" uključeno na projektu,
-- RLS je već aktiviran na svim tabelama iznad. Ovde se dodaje
-- eksplicitno radi jasnoće i da migracija bude potpuna sama za sebe.

alter table ensembles enable row level security;
alter table members enable row level security;
alter table staff enable row level security;
alter table rehearsals enable row level security;
alter table attendance enable row level security;
alter table costume_items enable row level security;
alter table resource_assignments enable row level security;
alter table notifications enable row level security;

-- Pomoćna funkcija: da li je trenutni korisnik član staff tabele
-- (bilo koja uloga: admin, rukovodilac, garderober)
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.staff where id = auth.uid()
  );
$$;

-- Pomoćna funkcija: da li trenutni korisnik ima konkretnu staff ulogu
create or replace function public.has_staff_role(required_role staff_role)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.staff
    where id = auth.uid() and user_role = required_role
  );
$$;

-- ---------- POLITIKE: ensembles ----------
create policy "staff upravlja ansamblima"
  on ensembles for all
  using (is_staff());

create policy "clan vidi svoj ansambl"
  on ensembles for select
  using (
    exists (select 1 from members where members.id = auth.uid() and members.ensemble_id = ensembles.id)
  );

-- ---------- POLITIKE: members ----------
create policy "clan vidi i menja svoj profil"
  on members for select
  using (auth.uid() = id);

create policy "clan azurira svoj profil"
  on members for update
  using (auth.uid() = id);

create policy "staff upravlja svim clanovima"
  on members for all
  using (is_staff());

-- ---------- POLITIKE: staff ----------
create policy "staff vidi svoj profil"
  on staff for select
  using (auth.uid() = id);

create policy "admin upravlja staff nalozima"
  on staff for all
  using (has_staff_role('admin'));

-- ---------- POLITIKE: rehearsals ----------
create policy "clan vidi probe svog ansambla"
  on rehearsals for select
  using (
    exists (
      select 1 from members
      where members.id = auth.uid() and members.ensemble_id = rehearsals.ensemble_id
    )
  );

create policy "staff upravlja probama"
  on rehearsals for all
  using (is_staff());

-- ---------- POLITIKE: attendance ----------
create policy "clan vidi svoje prisustvo"
  on attendance for select
  using (auth.uid() = member_id);

create policy "rukovodilac upravlja prisustvom"
  on attendance for all
  using (has_staff_role('rukovodilac'));

create policy "admin vidi statistiku prisustva"
  on attendance for select
  using (has_staff_role('admin'));

-- ---------- POLITIKE: costume_items ----------
create policy "clan vidi fundus"
  on costume_items for select
  using (true);

create policy "staff upravlja fundusom"
  on costume_items for all
  using (is_staff());

-- ---------- POLITIKE: resource_assignments ----------
create policy "clan vidi svoja zaduzenja"
  on resource_assignments for select
  using (auth.uid() = member_id);

create policy "garderober upravlja zaduzenjima"
  on resource_assignments for all
  using (has_staff_role('garderober'));

-- ---------- POLITIKE: notifications ----------
create policy "clan vidi svoje notifikacije"
  on notifications for select
  using (auth.uid() = member_id);

create policy "clan oznacava notifikaciju kao procitanu"
  on notifications for update
  using (auth.uid() = member_id);

create policy "staff kreira notifikacije"
  on notifications for insert
  with check (is_staff());