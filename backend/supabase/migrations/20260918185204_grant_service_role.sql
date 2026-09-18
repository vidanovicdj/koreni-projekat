-- service_role zaobilazi RLS, ali i dalje mu treba eksplicitan GRANT na tabele

grant select, insert, update, delete on
  ensembles, members, staff, rehearsals, attendance,
  costume_items, resource_assignments, notifications
to service_role;