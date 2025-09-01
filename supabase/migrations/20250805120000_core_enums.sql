CREATE TYPE transaction_type AS ENUM
  ('deposit','withdraw','internal_credit','internal_debit',
   'house_fee','game_win','game_loss','fee');

CREATE TYPE transaction_status AS ENUM ('pending','complete','failed');
CREATE TYPE game_type           AS ENUM ('speedchess','lastman','snakeroyale');
CREATE TYPE match_status        AS ENUM ('pending','active','finished','cancelled');