-- category je popust na članarinu (0%, 50%, 100%), ne grupa —
-- grupu predstavlja ensemble_id koji već postoji na members.

alter table members
  alter column category drop default,
  alter column category type smallint using 0,
  alter column category set default 0,
  add constraint members_category_check check (category in (0, 50, 100));

drop type if exists member_category;

-- Početne radionice (grupe)
insert into ensembles (ensemble_name) values
  ('Radionica za decu mlađeg uzrasta'),
  ('Radionica za decu starijeg uzrasta'),
  ('Radionica za omladince'),
  ('Radionica za veterane'),
  ('Omladinski izvođački ansambl'),
  ('Izvođački ansambl veterana');