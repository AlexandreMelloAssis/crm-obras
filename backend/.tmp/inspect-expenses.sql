SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public."Expenses"'::regclass
ORDER BY conname;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='Expenses'
ORDER BY ordinal_position;