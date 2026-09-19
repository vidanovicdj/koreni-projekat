alter table members add column avatar_url text;

-- Storage bucket za profilne slike (javno čitljiv, upload samo vlasnik)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

create policy "javno citanje avatara"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "clan uploaduje svoj avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "clan azurira svoj avatar"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);