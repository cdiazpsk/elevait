-- In-app notifications (complement to push/SMS)
CREATE TABLE notifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users ON DELETE CASCADE,
  title         text NOT NULL,
  body          text NOT NULL,
  type          text NOT NULL,
  entity_type   text,
  entity_id     uuid,
  is_read       boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, is_read, created_at DESC);

-- Vendor locations for real-time map tracking
CREATE TABLE vendor_locations (
  user_id     uuid PRIMARY KEY REFERENCES users ON DELETE CASCADE,
  location    geography(Point, 4326) NOT NULL,
  accuracy_m  numeric(6,2),
  heading     numeric(5,2),
  speed_mps   numeric(6,2),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_vendor_locations_geo ON vendor_locations USING GIST (location);
