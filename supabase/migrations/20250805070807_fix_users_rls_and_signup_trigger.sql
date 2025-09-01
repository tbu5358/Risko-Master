-- Fix infinite recursion in users RLS policy
DROP POLICY IF EXISTS "sel_user_self_or_admin" ON public.users;

-- Create simple user read policy without recursion
CREATE POLICY "users_read_own" ON public.users
  FOR SELECT 
  USING (id = auth.uid());

-- Create admin read policy using security definer function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND 'admin' = ANY(roles)
  );
$$;

CREATE POLICY "users_admin_read_all" ON public.users
  FOR SELECT 
  USING (public.is_admin());

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.users (id, username, roles)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    ARRAY['user']
  );
  
  -- Create wallet
  INSERT INTO public.wallets (user_id, balance, currency)
  VALUES (NEW.id, 0, 'USD');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create missing records for current authenticated users who don't have profiles
INSERT INTO public.users (id, username, roles)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'username', split_part(au.email, '@', 1)),
  ARRAY['user']
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- Create missing wallets for users who don't have them
INSERT INTO public.wallets (user_id, balance, currency)
SELECT 
  u.id,
  0,
  'USD'
FROM public.users u
LEFT JOIN public.wallets w ON u.id = w.user_id
WHERE w.user_id IS NULL;