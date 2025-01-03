-- 添加預設管理員帳號
INSERT INTO users (id, name, email, password, role, status, "createdAt", "updatedAt")
VALUES (
  'clrjw0dp10000mt08qw9ugq6x',
  '系統管理員',
  'admin@mbc.com',
  '$2a$10$VG2jOJqgJwxYoKXPp3KZU.4UbCMwXpWD6cyHZqXf4D8HDwNgBKjOO', -- 密碼: admin123
  'admin',
  'active',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
); 