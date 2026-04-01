-- Audit log: tracks all data modifications for compliance and debugging
CREATE TABLE audit_log (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name  text NOT NULL,
  record_id   text NOT NULL,
  action      text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data    jsonb,
  new_data    jsonb,
  user_id     uuid,
  ip_address  text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_audit_table ON audit_log (table_name, created_at DESC);
CREATE INDEX idx_audit_record ON audit_log (table_name, record_id);
CREATE INDEX idx_audit_user ON audit_log (user_id) WHERE user_id IS NOT NULL;

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id::text, TG_OP, to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id::text, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, user_id)
    VALUES (TG_TABLE_NAME, OLD.id::text, TG_OP, to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit triggers to key tables
CREATE TRIGGER audit_organizations AFTER INSERT OR UPDATE OR DELETE ON organizations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER audit_buildings AFTER INSERT OR UPDATE OR DELETE ON buildings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER audit_elevators AFTER INSERT OR UPDATE OR DELETE ON elevators
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER audit_service_contracts AFTER INSERT OR UPDATE OR DELETE ON service_contracts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER audit_service_events AFTER INSERT OR UPDATE OR DELETE ON service_events
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
CREATE TRIGGER audit_alerts AFTER INSERT OR UPDATE OR DELETE ON alerts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();
