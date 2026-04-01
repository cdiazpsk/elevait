-- Buildings with geospatial location and geofence configuration
CREATE TABLE buildings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES organizations ON DELETE CASCADE,
  name              text NOT NULL,
  address           text NOT NULL,
  location          geography(Point, 4326) NOT NULL,
  geofence_radius_m integer DEFAULT 150,
  timezone          text DEFAULT 'America/New_York',
  floors            integer,
  after_hours_start time,
  after_hours_end   time,
  metadata          jsonb DEFAULT '{}',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE TRIGGER buildings_updated_at
  BEFORE UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_buildings_organization ON buildings (organization_id);
CREATE INDEX idx_buildings_location ON buildings USING GIST (location);
