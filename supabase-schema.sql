-- ============================================================
-- Nafis Portfolio CMS — Supabase schema
-- Run this entire file once in Supabase Dashboard → SQL Editor.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Helpers ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Admin allow-list ----------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins can read own admin record" on public.admin_users;
create policy "admins can read own admin record"
on public.admin_users for select
to authenticated
using (user_id = auth.uid());

-- ---------- Site settings ----------
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  name text not null default 'Nafis Tamim',
  location text default 'Dhaka, Bangladesh',
  hero_status text default 'Academic Portfolio · 2026',
  hero_line_1 text default 'Learn.',
  hero_line_2 text default 'Compete.',
  hero_line_3 text default 'Build.',
  hero_description text default 'A science student from Dhaka, Bangladesh, pursuing opportunities across engineering, international STEM competitions, academic excellence, leadership, technology and global youth initiatives.',
  identity_label text default 'Student Profile / Bangladesh',
  identity_role text default 'STEM · Engineering · Leadership · Global Engagement',
  contact_heading text default 'Always open to the next challenge.',
  cv_url text default '',
  footer_left text default '© 2026 Nafis Tamim',
  footer_right text default 'Academic · STEM · Engineering · Leadership',
  hero_stats jsonb not null default '[
    {"label":"IYMC 2025","value":"Silver Honour"},
    {"label":"Linguistics","value":"Gold · Top 1%"},
    {"label":"STEM","value":"Special Honours"},
    {"label":"Global","value":"UN Climate Champion"}
  ]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------- Sections ----------
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nav_label text default '',
  eyebrow text default '',
  title text not null,
  subtitle text default '',
  kind text not null default 'custom'
    check (kind in ('honours','awards','certificates','competitions','leadership','projects','research','skills','custom')),
  position integer not null default 0,
  visible boolean not null default true,
  custom_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Awards ----------
create table if not exists public.awards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text default '',
  result text default '',
  year text default '',
  category text default '',
  symbol text default '✦',
  description text default '',
  image_url text default '',
  image_path text default '',
  certificate_url text default '',
  certificate_path text default '',
  featured boolean not null default false,
  published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Certificates ----------
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text default '',
  category text default '',
  year text default '',
  image_url text default '',
  image_path text default '',
  credential_url text default '',
  published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Competitions ----------
create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text default '',
  result text default '',
  year text default '',
  description text default '',
  published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Leadership ----------
create table if not exists public.leadership (
  id uuid primary key default gen_random_uuid(),
  organization text not null,
  role text not null,
  period text default '',
  description text default '',
  published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Projects ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  url text default '',
  image_url text default '',
  image_path text default '',
  tags text[] not null default '{}',
  published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Research ----------
create table if not exists public.research (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  url text default '',
  year text default '',
  published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Skills ----------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  items text[] not null default '{}',
  published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Social links ----------
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text default '',
  url text not null,
  published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['site_settings','sections','awards','certificates','competitions','leadership','projects','research','skills','social_links']
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', t, t);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ---------- RLS ----------
alter table public.site_settings enable row level security;
alter table public.sections enable row level security;
alter table public.awards enable row level security;
alter table public.certificates enable row level security;
alter table public.competitions enable row level security;
alter table public.leadership enable row level security;
alter table public.projects enable row level security;
alter table public.research enable row level security;
alter table public.skills enable row level security;
alter table public.social_links enable row level security;

-- Public read policies
create policy "public reads site settings" on public.site_settings for select to anon, authenticated using (true);
create policy "public reads visible sections" on public.sections for select to anon, authenticated using (visible = true or public.is_admin());
create policy "public reads published awards" on public.awards for select to anon, authenticated using (published = true or public.is_admin());
create policy "public reads published certificates" on public.certificates for select to anon, authenticated using (published = true or public.is_admin());
create policy "public reads published competitions" on public.competitions for select to anon, authenticated using (published = true or public.is_admin());
create policy "public reads published leadership" on public.leadership for select to anon, authenticated using (published = true or public.is_admin());
create policy "public reads published projects" on public.projects for select to anon, authenticated using (published = true or public.is_admin());
create policy "public reads published research" on public.research for select to anon, authenticated using (published = true or public.is_admin());
create policy "public reads published skills" on public.skills for select to anon, authenticated using (published = true or public.is_admin());
create policy "public reads published social links" on public.social_links for select to anon, authenticated using (published = true or public.is_admin());

-- Admin write policies
do $$
declare t text;
begin
  foreach t in array array['site_settings','sections','awards','certificates','competitions','leadership','projects','research','skills','social_links']
  loop
    execute format('create policy "admin inserts %I" on public.%I for insert to authenticated with check (public.is_admin())', t, t);
    execute format('create policy "admin updates %I" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t, t);
    execute format('create policy "admin deletes %I" on public.%I for delete to authenticated using (public.is_admin())', t, t);
  end loop;
end $$;

-- ---------- Storage ----------
insert into storage.buckets (id, name, public)
values ('portfolio-media','portfolio-media',true)
on conflict (id) do update set public = true;

drop policy if exists "public reads portfolio media" on storage.objects;
create policy "public reads portfolio media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio-media');

drop policy if exists "admin uploads portfolio media" on storage.objects;
create policy "admin uploads portfolio media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'portfolio-media' and public.is_admin());

drop policy if exists "admin updates portfolio media" on storage.objects;
create policy "admin updates portfolio media"
on storage.objects for update
to authenticated
using (bucket_id = 'portfolio-media' and public.is_admin())
with check (bucket_id = 'portfolio-media' and public.is_admin());

drop policy if exists "admin deletes portfolio media" on storage.objects;
create policy "admin deletes portfolio media"
on storage.objects for delete
to authenticated
using (bucket_id = 'portfolio-media' and public.is_admin());

-- ---------- Seed site ----------
insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

insert into public.sections (slug,nav_label,eyebrow,title,subtitle,kind,position,visible)
values
('honours','Honours','01 / Signature Honours','Achievements that define my journey.','A curated selection of major academic and international recognition.','honours',1,true),
('awards','Awards','02 / Awards','Recognition, captured.','Awards presented visually with context and verification.','awards',2,true),
('certificates','Certificates','03 / Credentials','Certificate Vault.','A visual archive of academic, international, STEM and global credentials.','certificates',3,true),
('academic-profile','Academic','04 / Academic Profile','The foundation behind the journey.','Science, mathematics, computing and engineering form the academic foundation of my portfolio.','custom',4,true),
('competitions','Competitions','05 / Global Competitions','Competing beyond borders.','International competitions that challenged me across multiple disciplines.','competitions',5,true),
('global-engagement','Global','06 / Global Engagement','Beyond academics.','United Nations learning, climate action and wider global youth engagement.','custom',6,true),
('leadership','Leadership','07 / Leadership','Learning by leading.','Roles where I learned through responsibility, outreach and collaboration.','leadership',7,true),
('projects','Projects','08 / Projects','Ideas are better when they are built.','Independent projects combining technology, problem solving and creativity.','projects',8,true),
('research','Research','09 / Research','Independent research.','Research is one part of my wider academic journey.','research',9,true),
('skills','Toolkit','10 / Toolkit','A compact toolkit.','A concise overview of the skills and tools I actively use.','skills',10,true)
on conflict (slug) do nothing;


update public.sections
set custom_data = jsonb_build_object(
  'body',
  'I am a science student at Dhaka City College, Class of 2026. My academic interests center on mathematics, physics, computer science and engineering, with a strong emphasis on analytical problem solving and learning beyond the syllabus.'
)
where slug = 'academic-profile' and custom_data = '{}'::jsonb;

update public.sections
set custom_data = jsonb_build_object(
  'body',
  'My wider global engagement includes recognition as a UN Climate Champion alongside additional United Nations learning and certificate-based programmes. These experiences connect my interest in technology and STEM with sustainability, climate action and responsible global citizenship.'
)
where slug = 'global-engagement' and custom_data = '{}'::jsonb;

insert into public.awards (title,organization,result,year,category,symbol,featured,position)
values
('International Youth Math Challenge','IYMC','Silver Honour','2025','Mathematics','∑',true,1),
('International Linguistics Challenge','International Linguistics Challenge','Gold Medalist · Top 1%','','Linguistics','1%',true,2),
('International Physics Competition','International Physics Competition','Special Honour','','Physics','Φ',true,3),
('International Chemistry Competition','International Chemistry Competition','Special Honour','','Chemistry','⚗',true,4),
('Academic Excellence Award','Academic Excellence Award','Academic Excellence','2026','Academic','A+',false,5),
('UASC Math Champion Bangladesh','Uttara Academy Science Club','Gold Medalist','','Mathematics','π',false,6),
('Essay Writing Competition','International Mother Language Institute','First Prize','2026','Academic','✦',false,7),
('Blue Ocean Student Peace Competition','Blue Ocean Student Peace Competition','Special Honour','','Global','◎',false,8)
on conflict do nothing;


insert into public.certificates (title,organization,category,year,position)
values
('IYMC 2025 Silver Honour','International Youth Math Challenge','International, STEM, Mathematics','2025',1),
('Gold Medal · Top 1%','International Linguistics Challenge','International, Linguistics','',2),
('Special Honour — Physics','International Physics Competition','International, STEM, Physics','',3),
('Special Honour — Chemistry','International Chemistry Competition','International, STEM, Chemistry','',4),
('UN Climate Champion','United Nations','United Nations, Global, Climate','',5),
('Academic Excellence Award 2026','Academic Excellence Award','Academic','2026',6),
('Essay Writing Competition — First Prize','International Mother Language Institute','Academic, Government, UNESCO','2026',7),
('UASC Math Champion Bangladesh — Gold Medalist','Uttara Academy Science Club','STEM, Mathematics, Academic','',8),
('Blue Ocean Student Peace Competition — Special Honour','Blue Ocean Student Peace Competition','International, Global','',9)
on conflict do nothing;

insert into public.competitions (name,organization,result,year,description,position)
values
('International Youth Math Challenge','IYMC','Silver Honour','2025','International mathematics competition.',1),
('International Linguistics Challenge','International Linguistics Challenge','Gold · Top 1%','International','Logic, analytical reasoning and linguistics.',2),
('International Physics Competition','International Physics Competition','Special Honour','International','Physics and scientific problem solving.',3),
('International Chemistry Competition','International Chemistry Competition','Special Honour','International','Chemistry and scientific reasoning.',4),
('Blue Ocean Student Peace Competition','Blue Ocean','Special Honour','Global','Student innovation and global engagement.',5)
on conflict do nothing;

insert into public.leadership (organization,role,period,description,position)
values
('Graphlair','Founder & CEO','Present','Leading a creative technology initiative combining design, digital solutions and entrepreneurship.',1),
('International Youth Math Challenge','Ambassador','Global STEM','Supporting mathematics outreach and international student participation.',2),
('International Computer Science Competition','Ambassador','Computing','Promoting international computing opportunities among students.',3),
('Dhaka City College Science Club','Executive Member','College','Contributing to student-led science and STEM activities.',4),
('Uttara Academy Science Club','Executive Member · Ambassador','UASC','Supporting STEM outreach, student engagement and competitive activities.',5)
on conflict do nothing;

insert into public.projects (title,description,tags,position)
values
('Graphlair','A digital design and technology initiative focused on creative solutions, branding, technology and entrepreneurship.',array['Technology','Design','Entrepreneurship','Leadership'],1),
('Independent STEM Exploration','Personal exploration across computing, engineering concepts, scientific problem solving and technology.',array['Engineering','Computing','STEM','Problem Solving'],2)
on conflict do nothing;

insert into public.research (title,description,url,year,position)
values
('TruthLens: An Explainable Multi-Agent Framework for Hallucination Detection through Evidence-Based Verification in Large Language Models',
'An independent research project exploring structured verification of AI-generated information and explainability.',
'https://zenodo.org/records/21790279','2026',1)
on conflict do nothing;

insert into public.skills (category,items,position)
values
('Programming',array['Python','HTML','CSS'],1),
('Academic',array['Research','Scientific Writing','LaTeX','Overleaf'],2),
('Creative',array['Graphic Design','Adobe Creative Tools','Web Design'],3),
('Core Interests',array['Engineering','Computer Science','Mathematics','Technology'],4)
on conflict do nothing;

insert into public.social_links (platform,label,url,position)
values
('Email','Email','nafistamim.academic@gmail.com',1),
('LinkedIn','LinkedIn','https://linkedin.com/in/nafistamim',2),
('ORCID','ORCID','https://orcid.org/0009-0003-0079-5480',3),
('Research','Research','https://zenodo.org/records/21790279',4)
on conflict do nothing;

-- ============================================================
-- IMPORTANT: CREATE YOUR ADMIN
-- 1) Supabase Dashboard → Authentication → Users → Add user.
-- 2) Replace YOUR_EMAIL below and run ONLY this statement once:
--
-- insert into public.admin_users(user_id)
-- select id from auth.users where email = 'YOUR_EMAIL'
-- on conflict (user_id) do nothing;
-- ============================================================
