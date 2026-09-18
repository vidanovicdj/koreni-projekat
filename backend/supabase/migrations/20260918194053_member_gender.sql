create type person_gender as enum ('musko', 'zensko');

alter table members
  add column gender person_gender;