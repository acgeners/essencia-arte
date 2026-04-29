alter table products
  add column if not exists production_days_min integer not null default 3,
  add column if not exists production_days_max integer not null default 5;

alter table products
  add constraint products_production_days_positive
  check (
    production_days_min > 0
    and production_days_max >= production_days_min
  );
