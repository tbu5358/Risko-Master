CREATE TABLE users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username   text UNIQUE NOT NULL,
  roles      text[] DEFAULT ARRAY['player'],
  joined_at  timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE wallets (
  user_id    uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance    bigint  NOT NULL DEFAULT 0,
  currency   text    NOT NULL DEFAULT 'USD',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);