import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { useSupabaseQuery } from "../../hooks/useSupabaseQuery";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

interface AlertRow {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
  elevator: { car_number: string; building: { name: string } } | null;
}

export default function AlertsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("active");
  const { data: alerts, loading, refetch } = useSupabaseQuery<AlertRow>({
    table: "alerts",
    select: "id, alert_type, severity, title, message, status, created_at, elevator:elevators(car_number, building:buildings(name))",
    filters: filter ? { status: filter } : {},
    order: { column: "created_at" },
  });

  async function acknowledge(alertId: string) {
    await supabase.from("alerts").update({ status: "acknowledged", acknowledged_by: user?.id }).eq("id", alertId);
    refetch();
  }

  async function resolve(alertId: string) {
    await supabase.from("alerts").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", alertId);
    refetch();
  }

  return (
    <div>
      <PageHeader title="Alerts" description="Monitor elevator health alerts" />

      <div className="flex gap-2 mb-4">
        {["active", "acknowledged", "resolved", ""].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? "bg-brand-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {f || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          No {filter || ""} alerts
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const elev = alert.elevator as any;
            return (
              <div key={alert.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-3">
                  <StatusBadge status={alert.severity} />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{alert.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {elev?.building?.name} — {elev?.car_number} &middot; {new Date(alert.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">{alert.message}</p>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={alert.status} />
                    {alert.status === "active" && (
                      <button onClick={() => acknowledge(alert.id)} className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg hover:bg-yellow-100 font-medium">
                        Acknowledge
                      </button>
                    )}
                    {(alert.status === "active" || alert.status === "acknowledged") && (
                      <button onClick={() => resolve(alert.id)} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-lg hover:bg-green-100 font-medium">
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
