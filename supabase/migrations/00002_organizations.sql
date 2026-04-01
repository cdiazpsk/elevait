-- Organizations: building owners, service vendors, and platform operators
CREATE TABLE organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  type        org_type NOT NULL,
  address     text,
  location    geography(Point, 4326),
  contact_email text NOT NULL,
  contact_phone text,
  settings    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_organizations_type ON organizations (type);
