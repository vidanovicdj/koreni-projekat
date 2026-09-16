-- Dodeljuje osnovne privilegije 'authenticated' roli na svim tabelama.
-- RLS politike i dalje kontrolišu koji redovi su vidljivi/izmenljivi —
-- ovo samo otvara "vrata" do tabele, RLS odlučuje šta se dešava dalje.

grant select, insert, update, delete on
  ensembles, members, staff, rehearsals, attendance,
  costume_items, resource_assignments, notifications
to authenticated;