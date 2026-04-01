-- Time-series sensor readings from IoT devices on elevators
-- Partitioned by month on recorded_at for query performance
CREATE TABLE sensor_readings (
  id            bigint GENERATED ALWAYS AS IDENTITY,
  elevator_id   uuid NOT NULL REFERENCES elevators ON DELETE CASCADE,
  device_id     text NOT NULL,
  reading_type  sensor_reading_type NOT NULL,
  value         numeric,
  metadata      jsonb DEFAULT '{}',
  recorded_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

-- Create partitions for current and next 3 months
CREATE TABLE sensor_readings_2026_04 PARTITION OF sensor_readings
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE sensor_readings_2026_05 PARTITION OF sensor_readings
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE sensor_readings_2026_06 PARTITION OF sensor_readings
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE sensor_readings_2026_07 PARTITION OF sensor_readings
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- Indexes on each partition (inherited)
CREATE INDEX idx_sensor_elevator_time ON sensor_readings (elevator_id, recorded_at DESC);
CREATE INDEX idx_sensor_device ON sensor_readings (device_id, recorded_at DESC);
CREATE INDEX idx_sensor_type ON sensor_readings (reading_type, recorded_at DESC);

-- RLS and pg_cron are configured in migration 00014_rls_policies.sql
