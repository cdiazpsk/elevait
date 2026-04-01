-- Fix RLS helper functions: add explicit search_path for Supabase compatibility
CREATE OR REPLACE FUNCTION is_operator()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = auth.uid() AND o.type = 'operator'
  );
$$;

CREATE OR REPLACE FUNCTION user_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$;
