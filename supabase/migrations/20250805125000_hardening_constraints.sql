-- never negative balance
ALTER TABLE wallets ADD CONSTRAINT chk_balance_nonneg CHECK (balance >= 0);

-- fee must be 0-1
ALTER TABLE matches ADD CONSTRAINT chk_fee_percent_range CHECK (fee_percent BETWEEN 0 AND 1);

-- unique winner or credit per match
CREATE UNIQUE INDEX unq_match_credit
ON transactions (match_id, user_id)
WHERE type IN ('internal_credit','game_win');

-- one house fee per match
CREATE UNIQUE INDEX unq_match_fee
ON transactions (match_id)
WHERE type = 'house_fee';

-- created_at index for time-range dashboards
CREATE INDEX idx_tx_created_at ON transactions (created_at DESC);