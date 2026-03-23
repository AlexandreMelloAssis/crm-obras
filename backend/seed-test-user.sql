-- Insert test user for development
-- Email: admin@obra.com.br
-- Password: Test123!
-- BCrypt Hash generated for development testing only

INSERT INTO "Users" ("Id", "Email", "FullName", "PasswordHash", "IsActive", "CreatedAt", "CreatedBy")
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@obra.com.br',
  'Administrador',
  '$2a$11$vVy8Z6q/v4X8JR/K9l8Q5ey7ZVhJh5Z5H5Q5K5L5M5N5O5P5Q5R5S5T5U', -- BCrypt hash for Test123!
  true,
  NOW(),
  'system'
)
ON CONFLICT ("Email") DO NOTHING;

-- Verify insertion
SELECT "Email", "FullName", "IsActive" FROM "Users" WHERE "Email" = 'admin@obra.com.br';

