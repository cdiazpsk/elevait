-- ══════════════════════════════════════════════════════════════
-- DEVELOPMENT-ONLY: Replace all complex RLS with simple auth check
-- TODO: Restore role-based RLS before production
-- ══════════════════════════════════════════════════════════════

-- Drop ALL existing policies on every table
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END;
$$;

-- Simple policies: any authenticated user can read all data

CREATE POLICY "auth_select" ON organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON buildings FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON elevators FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON service_contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON service_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON invoice_line_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON sensor_readings FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON geofence_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON vendor_locations FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert/update/delete as well for dev
CREATE POLICY "auth_insert" ON buildings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON buildings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_insert" ON elevators FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON elevators FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_insert" ON service_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON service_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_update" ON alerts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_update" ON notifications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_insert" ON geofence_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert" ON vendor_locations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON vendor_locations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_insert" ON invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_insert" ON invoice_line_items FOR INSERT TO authenticated WITH CHECK (true);

-- Keep the anon SELECT on organizations for signup page
CREATE POLICY "anon_select" ON organizations FOR SELECT TO anon USING (true);
