-- Enable required PostgreSQL extensions
-- PostGIS for geospatial queries (geofencing, building locations)
CREATE EXTENSION IF NOT EXISTS postgis;

-- pg_cron for scheduled jobs (materialized view refresh, partition management)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- pgcrypto for gen_random_uuid() if not already available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create custom enum types used across multiple tables
CREATE TYPE org_type AS ENUM ('owner', 'vendor', 'operator');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'technician', 'viewer');
CREATE TYPE contract_type AS ENUM ('full_maintenance', 'parts_and_labor', 'labor_only', 'on_demand');
CREATE TYPE elevator_status AS ENUM ('operational', 'out_of_order', 'maintenance', 'offline');
CREATE TYPE event_type AS ENUM ('callback', 'entrapment', 'pm_visit', 'repair', 'inspection', 'emergency');
CREATE TYPE event_status AS ENUM ('open', 'dispatched', 'in_progress', 'completed', 'cancelled');
CREATE TYPE event_priority AS ENUM ('critical', 'high', 'normal', 'low');
CREATE TYPE invoice_audit_status AS ENUM ('pending', 'passed', 'flagged', 'disputed', 'approved');
CREATE TYPE line_item_category AS ENUM ('travel_time', 'labor_regular', 'labor_overtime', 'parts', 'out_of_contract', 'pm_hours');
CREATE TYPE line_item_audit_result AS ENUM ('pending', 'valid', 'flagged', 'overcharge');
CREATE TYPE sensor_reading_type AS ENUM ('door_cycle', 'motor_current', 'travel_count', 'vibration', 'temperature', 'floor_stop', 'error_code');
CREATE TYPE geofence_event_type AS ENUM ('enter', 'exit');
CREATE TYPE alert_type AS ENUM ('door_failure_imminent', 'car_out_of_order', 'high_callback_rate', 'entrapment', 'sensor_offline');
CREATE TYPE alert_severity AS ENUM ('critical', 'warning', 'info');
CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved', 'auto_resolved');

-- Helper function: auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
