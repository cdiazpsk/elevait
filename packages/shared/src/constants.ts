// Application-wide constants

export const APP_NAME = "ELEVaiT";

// Alert thresholds (configurable per-building, these are defaults)
export const DEFAULT_ALERT_THRESHOLDS = {
  door_cycle_max: 500_000,          // Door cycles before flagging imminent failure
  motor_current_std_dev: 2,          // Standard deviations from 30-day mean
  door_time_pct_over_normal: 40,     // % slower than normal open/close time
  alert_escalation_min: 15,          // Minutes before unacknowledged alert escalates
  auto_resolve_normal_min: 30,       // Minutes of normal readings before auto-resolve
} as const;

// Invoice audit tolerances
export const INVOICE_AUDIT_TOLERANCES = {
  travel_time_buffer_min: 15,        // Minutes of allowed travel time variance
  on_site_time_buffer_min: 30,       // Minutes of allowed on-site time variance
} as const;

// Geofencing
export const GEOFENCE_DEFAULTS = {
  radius_m: 150,                     // Default geofence radius in meters
  location_broadcast_interval_s: 60, // Seconds between vendor location broadcasts
  min_accuracy_m: 50,                // Minimum GPS accuracy to accept geofence event
} as const;

// Pagination
export const PAGINATION = {
  default_per_page: 25,
  max_per_page: 100,
} as const;

// Sensor data retention
export const DATA_RETENTION = {
  sensor_readings_months: 24,        // Months to retain sensor readings
  audit_log_months: 60,              // Months to retain audit log
} as const;
