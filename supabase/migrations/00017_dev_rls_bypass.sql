-- Temporary development bypass: allow authenticated users to read all data
-- TODO: Remove this migration before production and rely on proper RLS policies

-- Buildings: allow any authenticated user to view
CREATE POLICY "Authenticated users can view all buildings"
  ON buildings FOR SELECT
  TO authenticated
  USING (true);

-- Elevators: allow any authenticated user to view
CREATE POLICY "Authenticated users can view all elevators"
  ON elevators FOR SELECT
  TO authenticated
  USING (true);

-- Service contracts: allow any authenticated user to view
CREATE POLICY "Authenticated users can view all contracts"
  ON service_contracts FOR SELECT
  TO authenticated
  USING (true);

-- Service events: allow any authenticated user to view
CREATE POLICY "Authenticated users can view all events"
  ON service_events FOR SELECT
  TO authenticated
  USING (true);

-- Alerts: allow any authenticated user to view
CREATE POLICY "Authenticated users can view all alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (true);

-- Invoices: allow any authenticated user to view
CREATE POLICY "Authenticated users can view all invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

-- Invoice line items: allow any authenticated user to view
CREATE POLICY "Authenticated users can view all line items"
  ON invoice_line_items FOR SELECT
  TO authenticated
  USING (true);
