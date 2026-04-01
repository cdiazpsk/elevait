// Database enum types - must match PostgreSQL enum definitions in migrations

export type OrgType = "owner" | "vendor" | "operator";
export type UserRole = "admin" | "manager" | "technician" | "viewer";
export type ContractType = "full_maintenance" | "parts_and_labor" | "labor_only" | "on_demand";
export type ElevatorStatus = "operational" | "out_of_order" | "maintenance" | "offline";
export type EventType = "callback" | "entrapment" | "pm_visit" | "repair" | "inspection" | "emergency";
export type EventStatus = "open" | "dispatched" | "in_progress" | "completed" | "cancelled";
export type EventPriority = "critical" | "high" | "normal" | "low";
export type InvoiceAuditStatus = "pending" | "passed" | "flagged" | "disputed" | "approved";
export type LineItemCategory = "travel_time" | "labor_regular" | "labor_overtime" | "parts" | "out_of_contract" | "pm_hours";
export type LineItemAuditResult = "pending" | "valid" | "flagged" | "overcharge";
export type SensorReadingType = "door_cycle" | "motor_current" | "travel_count" | "vibration" | "temperature" | "floor_stop" | "error_code";
export type GeofenceEventType = "enter" | "exit";
export type AlertType = "door_failure_imminent" | "car_out_of_order" | "high_callback_rate" | "entrapment" | "sensor_offline";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "active" | "acknowledged" | "resolved" | "auto_resolved";
