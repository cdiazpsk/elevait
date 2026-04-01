-- Service contracts between building owners and vendor organizations
CREATE TABLE service_contracts (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id                 uuid NOT NULL REFERENCES buildings ON DELETE CASCADE,
  vendor_org_id               uuid NOT NULL REFERENCES organizations ON DELETE RESTRICT,
  contract_type               contract_type NOT NULL,
  start_date                  date NOT NULL,
  end_date                    date NOT NULL,
  monthly_cost                numeric(10,2),
  max_response_min            integer,
  max_callback_response_min   integer,
  max_entrapment_response_min integer,
  included_pm_hours           numeric(6,2),
  overtime_rate               numeric(8,2),
  regular_rate                numeric(8,2),
  travel_allowance_min        integer,
  terms_document_url          text,
  is_active                   boolean DEFAULT true,
  created_at                  timestamptz DEFAULT now(),
  updated_at                  timestamptz DEFAULT now()
);

CREATE TRIGGER service_contracts_updated_at
  BEFORE UPDATE ON service_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_contracts_building ON service_contracts (building_id);
CREATE INDEX idx_contracts_vendor ON service_contracts (vendor_org_id);
CREATE INDEX idx_contracts_active ON service_contracts (is_active) WHERE is_active = true;
