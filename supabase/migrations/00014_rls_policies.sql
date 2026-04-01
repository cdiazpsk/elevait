-- ══════════════════════════════════════════════════════════════
-- Row Level Security policies for all tables
-- Applied AFTER all tables are created to avoid cross-reference issues
-- ══════════════════════════════════════════════════════════════

-- Helper: check if current user is an operator
CREATE OR REPLACE FUNCTION is_operator()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = auth.uid() AND o.type = 'operator'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's organization_id
CREATE OR REPLACE FUNCTION user_org_id()
RETURNS uuid AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── ORGANIZATIONS ────────────────────────────────────────────
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view organizations"
  ON organizations FOR SELECT
  USING (true);

CREATE POLICY "Admins can update own organization"
  ON organizations FOR UPDATE
  USING (id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- ── USERS ────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of own organization"
  ON users FOR SELECT
  USING (organization_id = user_org_id() OR is_operator());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can insert users in own org"
  ON users FOR INSERT
  WITH CHECK (organization_id = user_org_id());

CREATE POLICY "Admins can update users in own org"
  ON users FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- ── BUILDINGS ────────────────────────────────────────────────
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own buildings"
  ON buildings FOR SELECT
  USING (organization_id = user_org_id());

CREATE POLICY "Vendors can view contracted buildings"
  ON buildings FOR SELECT
  USING (id IN (
    SELECT building_id FROM service_contracts
    WHERE vendor_org_id = user_org_id() AND is_active = true
  ));

CREATE POLICY "Operators can view all buildings"
  ON buildings FOR SELECT
  USING (is_operator());

CREATE POLICY "Owners can insert buildings"
  ON buildings FOR INSERT
  WITH CHECK (organization_id = user_org_id());

CREATE POLICY "Owners can update buildings"
  ON buildings FOR UPDATE
  USING (organization_id = user_org_id());

-- ── ELEVATORS ────────────────────────────────────────────────
ALTER TABLE elevators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view elevators in accessible buildings"
  ON elevators FOR SELECT
  USING (building_id IN (SELECT id FROM buildings));

CREATE POLICY "Managers can insert elevators"
  ON elevators FOR INSERT
  WITH CHECK (building_id IN (
    SELECT id FROM buildings WHERE organization_id = user_org_id()
  ));

CREATE POLICY "Managers can update elevators"
  ON elevators FOR UPDATE
  USING (building_id IN (
    SELECT id FROM buildings WHERE organization_id = user_org_id()
  ));

-- ── SERVICE CONTRACTS ────────────────────────────────────────
ALTER TABLE service_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own building contracts"
  ON service_contracts FOR SELECT
  USING (building_id IN (
    SELECT id FROM buildings WHERE organization_id = user_org_id()
  ));

CREATE POLICY "Vendors view own contracts"
  ON service_contracts FOR SELECT
  USING (vendor_org_id = user_org_id());

CREATE POLICY "Operators view all contracts"
  ON service_contracts FOR SELECT
  USING (is_operator());

CREATE POLICY "Owner admins can manage contracts"
  ON service_contracts FOR ALL
  USING (building_id IN (
    SELECT id FROM buildings WHERE organization_id = user_org_id()
  ));

-- ── SERVICE EVENTS ───────────────────────────────────────────
ALTER TABLE service_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own building events"
  ON service_events FOR SELECT
  USING (elevator_id IN (
    SELECT e.id FROM elevators e
    JOIN buildings b ON e.building_id = b.id
    WHERE b.organization_id = user_org_id()
  ));

CREATE POLICY "Vendors view assigned events"
  ON service_events FOR SELECT
  USING (vendor_org_id = user_org_id());

CREATE POLICY "Operators view all events"
  ON service_events FOR SELECT
  USING (is_operator());

CREATE POLICY "Technicians can update assigned events"
  ON service_events FOR UPDATE
  USING (technician_id = auth.uid());

CREATE POLICY "Managers can create events"
  ON service_events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')
  ));

-- ── INVOICES ─────────────────────────────────────────────────
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors manage own invoices"
  ON invoices FOR ALL
  USING (vendor_org_id = user_org_id());

CREATE POLICY "Owners view invoices for own contracts"
  ON invoices FOR SELECT
  USING (contract_id IN (
    SELECT sc.id FROM service_contracts sc
    JOIN buildings b ON sc.building_id = b.id
    WHERE b.organization_id = user_org_id()
  ));

CREATE POLICY "Operators view all invoices"
  ON invoices FOR SELECT
  USING (is_operator());

ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view line items for accessible invoices"
  ON invoice_line_items FOR SELECT
  USING (invoice_id IN (SELECT id FROM invoices));

CREATE POLICY "Vendors manage line items for own invoices"
  ON invoice_line_items FOR ALL
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE vendor_org_id = user_org_id()
  ));

-- ── SENSOR READINGS ──────────────────────────────────────────
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view sensor data for accessible elevators"
  ON sensor_readings FOR SELECT
  USING (elevator_id IN (SELECT id FROM elevators));

-- ── GEOFENCE EVENTS ──────────────────────────────────────────
ALTER TABLE geofence_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own geofence events"
  ON geofence_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Owners view geofence events at own buildings"
  ON geofence_events FOR SELECT
  USING (building_id IN (
    SELECT id FROM buildings WHERE organization_id = user_org_id()
  ));

CREATE POLICY "Operators view all geofence events"
  ON geofence_events FOR SELECT
  USING (is_operator());

CREATE POLICY "Users can insert own geofence events"
  ON geofence_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ── ALERTS ───────────────────────────────────────────────────
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view alerts for own elevators"
  ON alerts FOR SELECT
  USING (elevator_id IN (
    SELECT e.id FROM elevators e
    JOIN buildings b ON e.building_id = b.id
    WHERE b.organization_id = user_org_id()
  ));

CREATE POLICY "Vendors view alerts for contracted elevators"
  ON alerts FOR SELECT
  USING (elevator_id IN (
    SELECT e.id FROM elevators e
    JOIN buildings b ON e.building_id = b.id
    JOIN service_contracts sc ON sc.building_id = b.id
    WHERE sc.vendor_org_id = user_org_id() AND sc.is_active = true
  ));

CREATE POLICY "Operators view all alerts"
  ON alerts FOR SELECT
  USING (is_operator());

CREATE POLICY "Users can acknowledge alerts they can see"
  ON alerts FOR UPDATE
  USING (elevator_id IN (SELECT id FROM elevators));

-- ── AUDIT LOG ────────────────────────────────────────────────
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators and admins can view audit log"
  ON audit_log FOR SELECT
  USING (is_operator() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- ── NOTIFICATIONS ────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE USING (user_id = auth.uid());

-- ── VENDOR LOCATIONS ─────────────────────────────────────────
ALTER TABLE vendor_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users update own location"
  ON vendor_locations FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Operators view all vendor locations"
  ON vendor_locations FOR SELECT
  USING (is_operator());

CREATE POLICY "Owners view contracted vendor locations"
  ON vendor_locations FOR SELECT
  USING (user_id IN (
    SELECT u.id FROM users u
    WHERE u.organization_id IN (
      SELECT sc.vendor_org_id FROM service_contracts sc
      JOIN buildings b ON sc.building_id = b.id
      WHERE b.organization_id = user_org_id() AND sc.is_active = true
    )
  ));

-- ── REALTIME ─────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE vendor_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE service_events;
