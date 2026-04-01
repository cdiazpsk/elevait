// TypeScript interfaces matching database tables
// These types are used across web, mobile, and Edge Functions

import type {
  OrgType, UserRole, ContractType, ElevatorStatus,
  EventType, EventStatus, EventPriority, InvoiceAuditStatus,
  LineItemCategory, LineItemAuditResult, SensorReadingType,
  GeofenceEventType, AlertType, AlertSeverity, AlertStatus,
} from "./enums";

// ── Core entities ────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  address: string | null;
  location: GeoPoint | null;
  contact_email: string;
  contact_phone: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  onesignal_player_id: string | null;
  is_active: boolean;
  preferences: UserPreferences;
  created_at: string;
}

export interface UserPreferences {
  notifications?: {
    push?: boolean;
    sms?: boolean;
    voice?: boolean;
    alert_types?: AlertType[];
  };
  timezone?: string;
  theme?: "light" | "dark";
}

export interface Building {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  location: GeoPoint;
  geofence_radius_m: number;
  timezone: string;
  floors: number | null;
  after_hours_start: string | null;
  after_hours_end: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Elevator {
  id: string;
  building_id: string;
  car_number: string;
  manufacturer: string | null;
  model: string | null;
  install_date: string | null;
  last_modernization: string | null;
  controller_type: string | null;
  iot_device_id: string | null;
  status: ElevatorStatus;
  floors_served: number[] | null;
  created_at: string;
  updated_at: string;
}

// ── Service & contracts ──────────────────────────────────────

export interface ServiceContract {
  id: string;
  building_id: string;
  vendor_org_id: string;
  contract_type: ContractType;
  start_date: string;
  end_date: string;
  monthly_cost: number | null;
  max_response_min: number | null;
  max_callback_response_min: number | null;
  max_entrapment_response_min: number | null;
  included_pm_hours: number | null;
  overtime_rate: number | null;
  regular_rate: number | null;
  travel_allowance_min: number | null;
  terms_document_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceEvent {
  id: string;
  elevator_id: string;
  contract_id: string | null;
  vendor_org_id: string | null;
  technician_id: string | null;
  event_type: EventType;
  status: EventStatus;
  priority: EventPriority;
  reported_at: string;
  dispatched_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  departed_at: string | null;
  response_time_min: number | null;
  root_cause: string | null;
  description: string | null;
  is_after_hours: boolean;
  created_at: string;
  updated_at: string;
}

// ── Invoicing ────────────────────────────────────────────────

export interface Invoice {
  id: string;
  contract_id: string;
  vendor_org_id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  total_amount: number;
  audit_status: InvoiceAuditStatus;
  audit_flags: AuditFlag[];
  submitted_at: string;
  reviewed_at: string | null;
  document_url: string | null;
  created_at: string;
}

export interface AuditFlag {
  category: LineItemCategory;
  severity: "info" | "warning" | "critical";
  message: string;
  expected_value?: number;
  actual_value?: number;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  service_event_id: string | null;
  category: LineItemCategory;
  description: string | null;
  quantity: number;
  unit_rate: number;
  amount: number;
  audit_result: LineItemAuditResult;
  audit_notes: string | null;
  created_at: string;
}

// ── IoT & Monitoring ─────────────────────────────────────────

export interface SensorReading {
  id: number;
  elevator_id: string;
  device_id: string;
  reading_type: SensorReadingType;
  value: number | null;
  metadata: Record<string, unknown>;
  recorded_at: string;
}

export interface GeofenceEvent {
  id: string;
  user_id: string;
  building_id: string;
  service_event_id: string | null;
  event_type: GeofenceEventType;
  location: GeoPoint;
  accuracy_m: number | null;
  recorded_at: string;
}

export interface Alert {
  id: string;
  elevator_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  data: Record<string, unknown>;
  status: AlertStatus;
  acknowledged_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

// ── Supporting types ─────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: "alert" | "invoice" | "service_event" | "system";
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface VendorLocation {
  user_id: string;
  location: GeoPoint;
  accuracy_m: number | null;
  heading: number | null;
  speed_mps: number | null;
  updated_at: string;
}

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

// ── Materialized view types (for reporting) ──────────────────

export interface ElevatorUptimeReport {
  elevator_id: string;
  car_number: string;
  building_name: string;
  uptime_30d: number;
  uptime_90d: number;
  uptime_365d: number;
}

export interface ResponseTimeReport {
  elevator_id: string;
  car_number: string;
  avg_response_min: number;
  median_response_min: number;
  p95_response_min: number;
  event_count: number;
}

export interface VendorBenchmark {
  vendor_org_id: string;
  vendor_name: string;
  region: string;
  avg_response_min: number;
  callback_rate: number;
  first_fix_rate: number;
  pm_completion_rate: number;
  composite_score: number;
}
