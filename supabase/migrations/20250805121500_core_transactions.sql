CREATE TABLE transactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id),
  match_id        uuid REFERENCES matches(id),
  type            transaction_type NOT NULL,
  status          transaction_status NOT NULL DEFAULT 'pending',
  amount          bigint NOT NULL CHECK (amount > 0),
  currency        text   NOT NULL DEFAULT 'USD',
  tx_ref          text,
  idempotency_key text UNIQUE,
  description     text,
  created_at      timestamptz DEFAULT now()
);
CREATE INDEX idx_tx_user_created ON transactions (user_id, created_at DESC);
CREATE INDEX idx_tx_match        ON transactions (match_id);