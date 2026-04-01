-- Alerts generated from sensor data analysis and threshold breaches
CREATE TABLE alerts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elevator_id     uuid NOT NULL REFERENCES elevators ON DELETE CASCADE,
  alert_type      alert_type NOT NULL,
  severity        alert_severity NOT NULL,
  title           text NOT NULL,
  message         text NOT NULL,
  data            jsonb DEFAULT '{}',
  status          alert_status DEFAULT 'active',
  acknowledged_by uuid REFERENCES users,
  resolved_at     timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_alerts_elevator ON alerts (elevator_id);
CREATE INDEX idx_alerts_status ON alerts (status);
CREATE INDEX idx_alerts_severity ON alerts (severity, status);
CREATE INDEX idx_alerts_created ON alerts (created_at DESC);
CREATE INDEX idx_alerts_active ON alerts (elevator_id, status) WHERE status = 'active';
