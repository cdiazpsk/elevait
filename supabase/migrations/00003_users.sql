-- Users: linked to Supabase Auth, scoped to an organization
CREATE TABLE users (
  id                uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  organization_id   uuid NOT NULL REFERENCES organizations ON DELETE RESTRICT,
  role              user_role NOT NULL DEFAULT 'viewer',
  full_name         text NOT NULL,
  phone             text,
  onesignal_player_id text,
  is_active         boolean DEFAULT true,
  preferences       jsonb DEFAULT '{}',
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX idx_users_organization ON users (organization_id);
CREATE INDEX idx_users_role ON users (organization_id, role);

-- Auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, organization_id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'organization_id')::uuid, NULL),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'viewer'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
