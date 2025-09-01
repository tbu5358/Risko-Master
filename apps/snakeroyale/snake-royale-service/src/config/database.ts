import { createClient } from '@supabase/supabase-js';
import config from './environment';

// Create Supabase client with service role key for backend operations
export const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Export for use in other files
export default supabase; 