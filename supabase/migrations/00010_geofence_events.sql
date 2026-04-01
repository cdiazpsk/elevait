-- Geofence events: vendor enter/exit at building locations
CREATE TABLE geofence_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES users ON DELETE CASCADE,
  building_id       uuid NOT NULL REFERENCES buildings ON DELETE CASCADE,
  service_event_id  uuid REFERENCES service_events,
  event_type        geofence_event_type NOT NULL,
  location          geography(Point, 4326) NOT NULL,
  accuracy_m        numeric(6,2),
  recorded_at       timestamptz DEFAULT now()
);

CREATE INDEX idx_geofence_user ON geofence_events (user_id, recorded_at DESC);
CREATE INDEX idx_geofence_building ON geofence_events (building_id, recorded_at DESC);
CREATE INDEX idx_geofence_service_event ON geofence_events (service_event_id) WHERE service_event_id IS NOT NULL;

-- Active visits view: pairs enter/exit events for on-site duration calculation
CREATE VIEW active_visits AS
SELECT
  ge_enter.user_id,
  ge_enter.building_id,
  ge_enter.service_event_id,
  ge_enter.recorded_at AS entered_at,
  ge_exit.recorded_at AS exited_at,
  CASE
    WHEN ge_exit.recorded_at IS NOT NULL
    THEN EXTRACT(EPOCH FROM (ge_exit.recorded_at - ge_enter.recorded_at))::integer / 60
    ELSE NULL
  END AS duration_min
FROM geofence_events ge_enter
LEFT JOIN LATERAL (
  SELECT recorded_at
  FROM geofence_events
  WHERE user_id = ge_enter.user_id
    AND building_id = ge_enter.building_id
    AND event_type = 'exit'
    AND recorded_at > ge_enter.recorded_at
  ORDER BY recorded_at ASC
  LIMIT 1
) ge_exit ON true
WHERE ge_enter.event_type = 'enter';
