-- Elevators (cars) within buildings
CREATE TABLE elevators (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id         uuid NOT NULL REFERENCES buildings ON DELETE CASCADE,
  car_number          text NOT NULL,
  manufacturer        text,
  model               text,
  install_date        date,
  last_modernization  date,
  controller_type     text,
  iot_device_id       text UNIQUE,
  status              elevator_status DEFAULT 'operational',
  floors_served       integer[],
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

CREATE TRIGGER elevators_updated_at
  BEFORE UPDATE ON elevators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_elevators_building ON elevators (building_id);
CREATE INDEX idx_elevators_status ON elevators (status);
CREATE INDEX idx_elevators_iot_device ON elevators (iot_device_id) WHERE iot_device_id IS NOT NULL;
