-- Invoices submitted by vendors, auto-audited against contract + geofence data
CREATE TABLE invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id     uuid NOT NULL REFERENCES service_contracts ON DELETE RESTRICT,
  vendor_org_id   uuid NOT NULL REFERENCES organizations ON DELETE RESTRICT,
  invoice_number  text NOT NULL UNIQUE,
  period_start    date NOT NULL,
  period_end      date NOT NULL,
  total_amount    numeric(10,2) NOT NULL,
  audit_status    invoice_audit_status DEFAULT 'pending',
  audit_flags     jsonb DEFAULT '[]',
  submitted_at    timestamptz DEFAULT now(),
  reviewed_at     timestamptz,
  document_url    text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_invoices_contract ON invoices (contract_id);
CREATE INDEX idx_invoices_vendor ON invoices (vendor_org_id);
CREATE INDEX idx_invoices_audit_status ON invoices (audit_status);
CREATE INDEX idx_invoices_submitted ON invoices (submitted_at DESC);

-- Invoice line items with individual audit results
CREATE TABLE invoice_line_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id        uuid NOT NULL REFERENCES invoices ON DELETE CASCADE,
  service_event_id  uuid REFERENCES service_events,
  category          line_item_category NOT NULL,
  description       text,
  quantity          numeric(8,2) NOT NULL,
  unit_rate         numeric(8,2) NOT NULL,
  amount            numeric(10,2) NOT NULL,
  audit_result      line_item_audit_result DEFAULT 'pending',
  audit_notes       text,
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX idx_line_items_invoice ON invoice_line_items (invoice_id);
CREATE INDEX idx_line_items_event ON invoice_line_items (service_event_id) WHERE service_event_id IS NOT NULL;
