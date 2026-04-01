// API request/response types for Edge Functions

import type { SensorReadingType, GeofenceEventType, AlertType, AlertSeverity } from "./enums";

// ── Telemetry ingestion ──────────────────────────────────────

export interface TelemetryPayload {
  device_id: string;
  readings: {
    type: SensorReadingType;
    value: number;
    metadata?: Record<string, unknown>;
    recorded_at?: string;
  }[];
}

export interface TelemetryResponse {
  success: boolean;
  readings_stored: number;
  alerts_generated: number;
}

// ── Geofence events ──────────────────────────────────────────

export interface GeofenceEventPayload {
  building_id: string;
  event_type: GeofenceEventType;
  latitude: number;
  longitude: number;
  accuracy_m?: number;
}

export interface GeofenceEventResponse {
  success: boolean;
  event_id: string;
  service_event_linked: boolean;
  travel_time_min?: number;
}

// ── Invoice audit ────────────────────────────────────────────

export interface InvoiceAuditResponse {
  invoice_id: string;
  audit_status: "passed" | "flagged";
  total_flags: number;
  flags: {
    line_item_id: string;
    category: string;
    severity: "info" | "warning" | "critical";
    message: string;
    expected: number | null;
    actual: number | null;
  }[];
}

// ── Notification dispatch ────────────────────────────────────

export interface SendNotificationPayload {
  alert_id?: string;
  entity_type: "alert" | "invoice" | "service_event" | "system";
  entity_id: string;
  title: string;
  body: string;
  severity?: AlertSeverity;
  recipient_user_ids?: string[];  // If empty, auto-determine from entity
  channels?: ("push" | "sms" | "voice")[];
}

// ── Reports ──────────────────────────────────────────────────

export interface ReportParams {
  start_date: string;
  end_date: string;
  building_id?: string;
  elevator_id?: string;
  vendor_org_id?: string;
}

// ── Pagination ───────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ── Common API response ──────────────────────────────────────

export interface ApiError {
  error: string;
  message: string;
  status: number;
}
