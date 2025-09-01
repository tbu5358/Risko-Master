ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY wallet_owner ON wallets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY tx_owner     ON transactions FOR SELECT USING (user_id = auth.uid());

-- participants can read their matches; admins (role array contains 'admin') can read all
CREATE POLICY match_part_or_admin
ON matches FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM match_participants p
    WHERE p.match_id = matches.id
      AND p.user_id  = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
      AND 'admin' = ANY (u.roles)
  )
);

-- participants can read their own participant rows; admins see all
CREATE POLICY part_self_or_admin
ON match_participants FOR SELECT
USING (
  match_participants.user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
      AND 'admin' = ANY (u.roles)
  )
);