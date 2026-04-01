-- Fix handle_new_user trigger: add explicit search_path and better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id uuid;
  _full_name text;
BEGIN
  -- Extract organization_id from metadata
  _org_id := (NEW.raw_user_meta_data->>'organization_id')::uuid;
  _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  -- Only create profile if organization_id was provided
  IF _org_id IS NOT NULL THEN
    INSERT INTO public.users (id, organization_id, role, full_name)
    VALUES (
      NEW.id,
      _org_id,
      'viewer'::user_role,
      _full_name
    );
  END IF;

  RETURN NEW;
END;
$$;
