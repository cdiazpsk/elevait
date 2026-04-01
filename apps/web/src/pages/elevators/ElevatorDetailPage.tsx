import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import { useSupabaseRecord, useSupabaseQuery } from "../../hooks/useSupabaseQuery";

interface Elevator {
  id: string;
  car_number: string;
  manufacturer: string | null;
  model: string | null;
  install_date: string | null;
  last_modernization: string | null;
  controller_type: string | null;
  iot_device_id: string | null;
  status: string;
  floors_served: number[] | null;
  building: { id: string; name: string } | null;
}

interface EventRow {
  id: string;
  event_type: string;
  status: string;
  priority: string;
  reported_at: string;
  description: string | null;
  response_time_min: number | null;
}

export default function ElevatorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: elevator, loading } = useSupabaseRecord<Elevator>(
    "elevators", id, "*, building:buildings(id, name)"
  );
  const { data: events, loading: eventsLoading } = useSupabaseQuery<EventRow>({
    table: "service_events",
    select: "id, event_type, status, priority, reported_at, description, response_time_min",
    filters: { elevator_id: id },
    order: { column: "reported_at" },
    enabled: !!id,
  });
  const { data: alerts } = useSupabaseQuery<{ id: string; alert_type: string; severity: string; title: string; status: string; created_at: string }>({
    table: "alerts",
    select: "id, alert_type, severity, title, status, created_at",
    filters: { elevator_id: id },
    order: { column: "created_at" },
    enabled: !!id,
  });

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!elevator) return <div className="text-center py-12 text-gray-500">Elevator not found</div>;

  const building = elevator.building as any;

  return (
    <div>
      <PageHeader
        title={`${building?.name} — ${elevator.car_number}`}
        breadcrumbs={[
          { label: "Buildings", to: "/buildings" },
          { label: building?.name, to: `/buildings/${building?.id}` },
          { label: elevator.car_number },
        ]}
      />

      <div className="flex items-center gap-3 mb-6">
        <StatusBadge status={elevator.status} />
        {elevator.iot_device_id && <code className="text-xs bg-gray-100 px-2 py-1 rounded">{elevator.iot_device_id}</code>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Manufacturer", value: elevator.manufacturer ?? "—" },
          { label: "Model", value: elevator.model ?? "—" },
          { label: "Installed", value: elevator.install_date ? new Date(elevator.install_date).toLocaleDateString() : "—" },
          { label: "Last Modernization", value: elevator.last_modernization ? new Date(elevator.last_modernization).toLocaleDateString() : "—" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Alerts</h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <StatusBadge status={alert.severity} />
                <span className="text-sm font-medium flex-1">{alert.title}</span>
                <StatusBadge status={alert.status} />
                <span className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Service History</h2>
      <DataTable
        columns={[
          { key: "event_type", header: "Type", render: (e) => <span className="capitalize">{e.event_type.replace(/_/g, " ")}</span> },
          { key: "status", header: "Status", render: (e) => <StatusBadge status={e.status} /> },
          { key: "priority", header: "Priority", render: (e) => <StatusBadge status={e.priority} /> },
          { key: "reported_at", header: "Reported", render: (e) => new Date(e.reported_at).toLocaleDateString() },
          { key: "response_time_min", header: "Response", render: (e) => e.response_time_min ? `${e.response_time_min} min` : "—" },
          { key: "description", header: "Description", render: (e) => <span className="truncate max-w-xs block">{e.description?.slice(0, 60) || "—"}</span> },
        ]}
        data={events}
        loading={eventsLoading}
        onRowClick={(e) => navigate(`/events/${e.id}`)}
        emptyMessage="No service events for this elevator."
      />
    </div>
  );
}
