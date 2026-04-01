import { useParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { useSupabaseRecord } from "../../hooks/useSupabaseQuery";
import { supabase } from "../../lib/supabase";

interface ServiceEvent {
  id: string;
  event_type: string;
  status: string;
  priority: string;
  reported_at: string;
  dispatched_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  departed_at: string | null;
  response_time_min: number | null;
  root_cause: string | null;
  description: string | null;
  is_after_hours: boolean;
  elevator: { car_number: string; building: { id: string; name: string } } | null;
  vendor: { name: string } | null;
  technician: { full_name: string } | null;
}

export default function EventDetailPage() {
  const { id } = useParams();
  const { data: event, loading, refetch } = useSupabaseRecord<ServiceEvent>(
    "service_events", id,
    "*, elevator:elevators(car_number, building:buildings(id, name)), vendor:organizations!vendor_org_id(name), technician:users!technician_id(full_name)"
  );

  async function updateStatus(newStatus: string) {
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === "completed") updates.completed_at = new Date().toISOString();
    if (newStatus === "dispatched") updates.dispatched_at = new Date().toISOString();
    await supabase.from("service_events").update(updates).eq("id", id);
    refetch();
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!event) return <div className="text-center py-12 text-gray-500">Event not found</div>;

  const elev = event.elevator as any;
  const vendor = event.vendor as any;
  const tech = event.technician as any;

  const timeline = [
    { label: "Reported", time: event.reported_at },
    { label: "Dispatched", time: event.dispatched_at },
    { label: "Arrived", time: event.arrived_at },
    { label: "Completed", time: event.completed_at },
    { label: "Departed", time: event.departed_at },
  ].filter((t) => t.time);

  return (
    <div>
      <PageHeader
        title={`${event.event_type.replace(/_/g, " ")} — ${elev?.building?.name} ${elev?.car_number}`}
        breadcrumbs={[
          { label: "Service Events", to: "/events" },
          { label: `#${event.id.slice(0, 8)}` },
        ]}
      />

      <div className="flex items-center gap-3 mb-6">
        <StatusBadge status={event.status} />
        <StatusBadge status={event.priority} />
        <span className="capitalize text-sm font-medium text-gray-700">{event.event_type.replace(/_/g, " ")}</span>
        {event.is_after_hours && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">After Hours</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Description</h3>
            <p className="text-sm text-gray-900">{event.description || "No description provided."}</p>
            {event.root_cause && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Root Cause</h4>
                <p className="text-sm text-gray-900">{event.root_cause}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Timeline</h3>
            <div className="space-y-4">
              {timeline.map((step, i) => (
                <div key={step.label} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-brand-500" />
                    {i < timeline.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-1" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{step.label}</p>
                    <p className="text-xs text-gray-500">{new Date(step.time!).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Assignment</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Vendor</dt>
                <dd className="text-gray-900">{vendor?.name ?? "Unassigned"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Technician</dt>
                <dd className="text-gray-900">{tech?.full_name ?? "Unassigned"}</dd>
              </div>
              {event.response_time_min && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Response Time</dt>
                  <dd className="text-gray-900 font-medium">{event.response_time_min} min</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Actions</h3>
            <div className="space-y-2">
              {event.status === "open" && (
                <button onClick={() => updateStatus("dispatched")} className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Mark Dispatched
                </button>
              )}
              {event.status === "dispatched" && (
                <button onClick={() => updateStatus("in_progress")} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Mark In Progress
                </button>
              )}
              {(event.status === "in_progress" || event.status === "dispatched") && (
                <button onClick={() => updateStatus("completed")} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Mark Completed
                </button>
              )}
              {event.status !== "cancelled" && event.status !== "completed" && (
                <button onClick={() => updateStatus("cancelled")} className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel Event
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
