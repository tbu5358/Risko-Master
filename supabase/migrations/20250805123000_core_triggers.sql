-- updated_at helper ─ secure
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER                             -- runs with owner rights
SET search_path = ''                        -- empty path, force schema‑qualified names
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_upd   BEFORE UPDATE ON users   FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER trg_wallets_upd BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- wallet ↔ ledger sync ─ secure
CREATE OR REPLACE FUNCTION tx_to_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.status <> 'complete' THEN
    RETURN NEW;
  END IF;

  IF NEW.type IN ('internal_credit','game_win','deposit','house_fee') THEN
    UPDATE public.wallets
      SET balance = balance + NEW.amount
      WHERE user_id = NEW.user_id;
  ELSE
    UPDATE public.wallets
      SET balance = balance - NEW.amount
      WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tx_wallet
AFTER INSERT ON transactions FOR EACH ROW EXECUTE PROCEDURE tx_to_wallet();

-- Prevent direct invocation by normal user roles
REVOKE EXECUTE ON FUNCTION set_updated_at() FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION tx_to_wallet()  FROM authenticated, anon;