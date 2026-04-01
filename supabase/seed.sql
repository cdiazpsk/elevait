-- ELEVaiT seed data for local development
-- Run with: supabase db reset (applies migrations then seeds)

-- ══════════════════════════════════════════════════════════════
-- Organizations
-- ══════════════════════════════════════════════════════════════

INSERT INTO organizations (id, name, type, address, contact_email, contact_phone, location) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Metro Property Group', 'owner', '100 Park Ave, New York, NY 10017', 'admin@metropg.com', '+12125551000',
    ST_SetSRID(ST_MakePoint(-73.9762, 40.7527), 4326)::geography),
  ('b0000000-0000-0000-0000-000000000001', 'Apex Elevator Services', 'vendor', '500 Industrial Blvd, Newark, NJ 07102', 'dispatch@apexelevator.com', '+19735551000',
    ST_SetSRID(ST_MakePoint(-74.1724, 40.7357), 4326)::geography),
  ('c0000000-0000-0000-0000-000000000001', 'ELEVaiT Operations', 'operator', '200 Tech Drive, Austin, TX 78701', 'ops@elevait.com', '+15125551000',
    ST_SetSRID(ST_MakePoint(-97.7431, 30.2672), 4326)::geography);

-- ══════════════════════════════════════════════════════════════
-- Buildings (owned by Metro Property Group)
-- ══════════════════════════════════════════════════════════════

INSERT INTO buildings (id, organization_id, name, address, location, geofence_radius_m, timezone, floors, after_hours_start, after_hours_end) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
    'Metro Tower One', '100 Park Ave, New York, NY 10017',
    ST_SetSRID(ST_MakePoint(-73.9762, 40.7527), 4326)::geography,
    150, 'America/New_York', 42, '18:00', '07:00'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
    'Metro Plaza', '250 Broadway, New York, NY 10007',
    ST_SetSRID(ST_MakePoint(-74.0060, 40.7128), 4326)::geography,
    120, 'America/New_York', 28, '19:00', '06:00'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
    'Metro Residential', '350 E 72nd St, New York, NY 10021',
    ST_SetSRID(ST_MakePoint(-73.9580, 40.7685), 4326)::geography,
    100, 'America/New_York', 18, NULL, NULL);

-- ══════════════════════════════════════════════════════════════
-- Elevators
-- ══════════════════════════════════════════════════════════════

INSERT INTO elevators (id, building_id, car_number, manufacturer, model, install_date, status, floors_served, iot_device_id) VALUES
  -- Metro Tower One: 6 elevators
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Car A', 'Otis', 'Gen2 MRL', '2015-03-15', 'operational', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], 'IOT-MT1-A'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Car B', 'Otis', 'Gen2 MRL', '2015-03-15', 'operational', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], 'IOT-MT1-B'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Car C', 'Otis', 'Gen2 MRL', '2015-03-15', 'operational', ARRAY[1,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42], 'IOT-MT1-C'),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'Car D', 'Otis', 'Gen2 MRL', '2015-03-15', 'out_of_order', ARRAY[1,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42], 'IOT-MT1-D'),
  -- Metro Plaza: 4 elevators
  ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000002', 'Elevator 1', 'ThyssenKrupp', 'Synergy', '2018-07-01', 'operational', ARRAY[1,2,3,4,5,6,7,8,9,10,11,12,13,14], 'IOT-MP-1'),
  ('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000002', 'Elevator 2', 'ThyssenKrupp', 'Synergy', '2018-07-01', 'operational', ARRAY[1,15,16,17,18,19,20,21,22,23,24,25,26,27,28], 'IOT-MP-2'),
  -- Metro Residential: 2 elevators
  ('e0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000003', 'Main', 'Schindler', '3300', '2010-01-10', 'operational', NULL, 'IOT-MR-M'),
  ('e0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000003', 'Service', 'Schindler', '3300', '2010-01-10', 'maintenance', NULL, 'IOT-MR-S');

-- ══════════════════════════════════════════════════════════════
-- Service Contracts
-- ══════════════════════════════════════════════════════════════

INSERT INTO service_contracts (id, building_id, vendor_org_id, contract_type, start_date, end_date, monthly_cost, max_response_min, max_callback_response_min, max_entrapment_response_min, included_pm_hours, overtime_rate, regular_rate, travel_allowance_min) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
    'full_maintenance', '2025-01-01', '2027-12-31', 8500.00, 60, 45, 30, 24.00, 125.00, 85.00, 45),
  ('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001',
    'parts_and_labor', '2025-06-01', '2027-05-31', 5200.00, 90, 60, 30, 16.00, 110.00, 75.00, 60),
  ('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001',
    'labor_only', '2026-01-01', '2026-12-31', 2800.00, 120, 90, 45, 8.00, 100.00, 70.00, 30);

-- ══════════════════════════════════════════════════════════════
-- Sample Service Events
-- ══════════════════════════════════════════════════════════════

INSERT INTO service_events (id, elevator_id, contract_id, vendor_org_id, event_type, status, priority, reported_at, description, root_cause, is_after_hours) VALUES
  ('10000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
    'callback', 'open', 'high', now() - interval '2 hours', 'Car D not responding to hall calls, passengers reporting long wait times', NULL, false),
  ('10000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
    'pm_visit', 'completed', 'normal', now() - interval '7 days', 'Monthly preventive maintenance - Car A', 'N/A - scheduled maintenance', false),
  ('10000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001',
    'callback', 'completed', 'normal', now() - interval '14 days', 'Door closing slowly on 8th floor', 'door_operator_adjustment', false),
  ('10000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001',
    'repair', 'in_progress', 'normal', now() - interval '1 day', 'Service elevator annual inspection prep and repairs', NULL, false);

-- ══════════════════════════════════════════════════════════════
-- Sample Alerts
-- ══════════════════════════════════════════════════════════════

INSERT INTO alerts (id, elevator_id, alert_type, severity, title, message, status, data) VALUES
  ('20000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'car_out_of_order', 'critical',
    'Car D - Out of Order', 'Metro Tower One Car D is currently out of order. Error code E-42 detected. Service event has been created.',
    'active', '{"error_code": "E-42", "last_operational": "2026-03-31T14:30:00Z"}'),
  ('20000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'door_failure_imminent', 'warning',
    'Car A - Door Wear Detected', 'Metro Tower One Car A door cycle count approaching threshold. Current: 485,000 cycles. Threshold: 500,000. Schedule preventive door service.',
    'acknowledged', '{"door_cycles": 485000, "threshold": 500000, "door_motor_current_trend": "stable"}');
