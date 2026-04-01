-- ══════════════════════════════════════════════════════════════
-- DEVELOPMENT ONLY: Disable RLS on all tables
-- TODO: Re-enable and configure proper RLS before production
-- ══════════════════════════════════════════════════════════════

ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE elevators DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings DISABLE ROW LEVEL SECURITY;
ALTER TABLE geofence_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_locations DISABLE ROW LEVEL SECURITY;
