-- Service events: callbacks, entrapments, PM visits, repairs, inspections, emergencies
CREATE TABLE service_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elevator_id       uuid NOT NULL REFERENCES elevators ON DELETE CASCADE,
  contract_id       uuid REFERENCES service_contracts,
  vendor_org_id     uuid REFERENCES organizations,
  technician_id     uuid REFERENCES users,
  event_type        event_type NOT NULL,
  status            event_status DEFAULT 'open',
  priority          event_priority DEFAULT 'normal',
  reported_at       timestamptz NOT NULL DEFAULT now(),
  dispatched_at     timestamptz,
  arrived_at        timestamptz,
  completed_at      timestamptz,
  departed_at       timestamptz,
  response_time_min integer GENERATED ALWAYS AS (
    CASE
      WHEN arrived_at IS NOT NULL AND reported_at IS NOT NULL
      THEN EXTRACT(EPOCH FROM (arrived_at - reported_at))::integer / 60
      ELSE NULL
    END
  ) STORED,
  root_cause        text,
  description       text,
  is_after_hours    boolean DEFAULT false,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE TRIGGER service_events_updated_at
  BEFORE UPDATE ON service_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_events_elevator ON service_events (elevator_id);
CREATE INDEX idx_events_status ON service_events (status);
CREATE INDEX idx_events_type ON service_events (event_type);
CREATE INDEX idx_events_technician ON service_events (technician_id) WHERE technician_id IS NOT NULL;
CREATE INDEX idx_events_vendor ON service_events (vendor_org_id);
CREATE INDEX idx_events_reported ON service_events (reported_at DESC);
