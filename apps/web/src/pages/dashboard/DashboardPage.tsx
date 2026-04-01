import { useAuth } from "../../context/AuthContext";
import { useSupabaseQuery } from "../../hooks/useSupabaseQuery";
import StatusBadge from "../../components/ui/StatusBadge";
import { Link } from "react-router-dom";

interface StatCard {
  label: string;
  value: number;
  color: string;
  to: string;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const { data: buildings } = useSupabaseQuery<{ id: string }>({ table: "buildings", select: "id" });
  const { data: elevators } = useSupabaseQuery<{ id: string; status: string }>({ table: "elevators", select: "id, status" });
  const { data: activeAlerts } = useSupabaseQuery<{ id: string; elevator_id: string; alert_type: string; severity: string; title: string; created_at: string }>({
    table: "alerts",
    select: "id, elevator_id, alert_type, severity, title, created_at",
    filters: { status: "active" },
    order: { column: "created_at" },
  });
  const { data: openEvents } = useSupabaseQuery<{ id: string; elevator_id: string; event_type: string; status: string; priority: string; reported_at: string; description: string }>({
    table: "service_events",
    select: "id, elevator_id, event_type, status, priority, reported_at, description",
    order: { column: "reported_at" },
  });

  const outOfOrder = elevators.filter((e) => e.status === "out_of_order").length;
  const inMaintenance = elevators.filter((e) => e.status === "maintenance").length;

  const stats: StatCard[] = [
    { label: "Buildings", value: buildings.length, color: "bg-brand-500", to: "/buildings" },
    { label: "Elevators", value: elevators.length, color: "bg-green-500", to: "/elevators" },
    { label: "Out of Order", value: outOfOrder, color: "bg-red-500", to: "/elevators" },
    { label: "Active Alerts", value: activeAlerts.length, color: "bg-orange-500", to: "/alerts" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 mt-1">{profile?.organization?.name} — {profile?.organization?.type} account</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <div className={`h-1 w-12 ${stat.color} rounded-full mt-3`} />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
            <Link to="/alerts" className="text-sm text-brand-600 hover:text-brand-700">View all</Link>
          </div>
          {activeAlerts.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No active alerts</p>
          ) : (
            <div className="space-y-3">
              {activeAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <StatusBadge status={alert.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                    <p className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Service Events</h2>
            <Link to="/events" className="text-sm text-brand-600 hover:text-brand-700">View all</Link>
          </div>
          {openEvents.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No open service events</p>
          ) : (
            <div className="space-y-3">
              {openEvents.slice(0, 5).map((event) => (
                <Link key={event.id} to={`/events/${event.id}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors block">
                  <StatusBadge status={event.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.event_type.replace(/_/g, " ")} — {event.description?.slice(0, 60) || "No description"}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(event.reported_at).toLocaleString()}</p>
                  </div>
                  <StatusBadge status={event.priority} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {(outOfOrder > 0 || inMaintenance > 0) && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fleet Status</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">{elevators.length - outOfOrder - inMaintenance} Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">{outOfOrder} Out of Order</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-gray-600">{inMaintenance} In Maintenance</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
