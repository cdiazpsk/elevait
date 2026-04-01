import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import { useSupabaseQuery } from "../../hooks/useSupabaseQuery";

interface EventRow {
  id: string;
  event_type: string;
  status: string;
  priority: string;
  reported_at: string;
  description: string | null;
  is_after_hours: boolean;
  elevator: { car_number: string; building: { name: string } } | null;
}

export default function EventsListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: events, loading } = useSupabaseQuery<EventRow>({
    table: "service_events",
    select: "id, event_type, status, priority, reported_at, description, is_after_hours, elevator:elevators(car_number, building:buildings(name))",
    filters: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(typeFilter ? { event_type: typeFilter } : {}),
    },
    order: { column: "reported_at" },
  });

  return (
    <div>
      <PageHeader
        title="Service Events"
        description="Track callbacks, entrapments, maintenance, and repairs"
        action={{ label: "+ New Event", to: "/events/new" }}
      />

      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
        >
          <option value="">All statuses</option>
          {["open", "dispatched", "in_progress", "completed", "cancelled"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
        >
          <option value="">All types</option>
          {["callback", "entrapment", "pm_visit", "repair", "inspection", "emergency"].map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={[
          { key: "event_type", header: "Type", render: (e) => <span className="capitalize font-medium">{e.event_type.replace(/_/g, " ")}</span> },
          { key: "building", header: "Building / Car", render: (e) => {
            const elev = e.elevator as any;
            return <span>{elev?.building?.name} — {elev?.car_number}</span>;
          }},
          { key: "status", header: "Status", render: (e) => <StatusBadge status={e.status} /> },
          { key: "priority", header: "Priority", render: (e) => <StatusBadge status={e.priority} /> },
          { key: "reported_at", header: "Reported", render: (e) => new Date(e.reported_at).toLocaleString() },
          { key: "is_after_hours", header: "After Hrs", className: "text-center", render: (e) => e.is_after_hours ? "Yes" : "—" },
          { key: "description", header: "Description", render: (e) => <span className="truncate max-w-xs block text-gray-600">{e.description?.slice(0, 50) || "—"}</span> },
        ]}
        data={events}
        loading={loading}
        onRowClick={(e) => navigate(`/events/${e.id}`)}
        emptyMessage="No service events found."
      />
    </div>
  );
}
