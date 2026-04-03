import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
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
  vendor_org_id: string | null;
  technician_id: string | null;
  contract_id: string | null;
  elevator_id: string;
  elevator: { car_number: string; building: { id: string; name: string } } | null;
  vendor: { name: string } | null;
  technician: { full_name: string } | null;
}

interface VendorOption {
  id: string;
  name: string;
}

interface TechOption {
  id: string;
  full_name: string;
}

interface ContractOption {
  id: string;
  contract_type: string;
  vendor_org_id: string;
  monthly_cost: number;
}

export default function EventDetailPage() {
  const { id } = useParams();
  const { data: event, loading, refetch } = useSupabaseRecord<ServiceEvent>(
    "service_events", id,
    "*, elevator:elevators(car_number, building_id, building:buildings(id, name)), vendor:organizations!vendor_org_id(name), technician:users!technician_id(full_name)"
  );

  // Assignment state
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [technicians, setTechnicians] = useState<TechOption[]>([]);
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedTech, setSelectedTech] = useState("");
  const [selectedContract, setSelectedContract] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Load vendors (organizations with type = vendor)
  useEffect(() => {
    supabase.from("organizations").select("id, name").eq("type", "vendor").then(({ data }) => {
      if (data) setVendors(data);
    });
  }, []);

  // When vendor changes, load their technicians
  useEffect(() => {
    if (!selectedVendor) { setTechnicians([]); return; }
    supabase.from("users").select("id, full_name")
      .eq("organization_id", selectedVendor)
      .in("role", ["technician", "admin", "manager"])
      .then(({ data }) => {
        if (data) setTechnicians(data);
      });
  }, [selectedVendor]);

  // Load contracts for the elevator's building when event loads
  useEffect(() => {
    if (!event) return;
    const buildingId = (event.elevator as any)?.building_id || (event.elevator as any)?.building?.id;
    if (!buildingId) return;
    supabase.from("service_contracts").select("id, contract_type, vendor_org_id, monthly_cost")
      .eq("building_id", buildingId)
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) setContracts(data);
      });

    // Pre-fill current assignments
    if (event.vendor_org_id) setSelectedVendor(event.vendor_org_id);
    if (event.technician_id) setSelectedTech(event.technician_id);
    if (event.contract_id) setSelectedContract(event.contract_id);
  }, [event?.id]);

  async function handleAssignAndDispatch() {
    if (!id) return;
    setAssigning(true);
    const updates: Record<string, unknown> = {};
    if (selectedVendor) updates.vendor_org_id = selectedVendor;
    if (selectedTech) updates.technician_id = selectedTech;
    if (selectedContract) updates.contract_id = selectedContract;
    if (event?.status === "open") {
      updates.status = "dispatched";
      updates.dispatched_at = new Date().toISOString();
    }
    await supabase.from("service_events").update(updates).eq("id", id);
    setAssigning(false);
    setShowAssignPanel(false);
    refetch();
  }

  async function handleAssignOnly() {
    if (!id) return;
    setAssigning(true);
    const updates: Record<string, unknown> = {};
    if (selectedVendor) updates.vendor_org_id = selectedVendor;
    if (selectedTech) updates.technician_id = selectedTech;
    if (selectedContract) updates.contract_id = selectedContract;
    await supabase.from("service_events").update(updates).eq("id", id);
    setAssigning(false);
    setShowAssignPanel(false);
    refetch();
  }

  async function updateStatus(newStatus: string) {
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === "completed") updates.completed_at = new Date().toISOString();
    if (newStatus === "dispatched") updates.dispatched_at = new Date().toISOString();
    if (newStatus === "in_progress") updates.arrived_at = new Date().toISOString();
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
    { label: "Technician Arrived", time: event.arrived_at },
    { label: "Completed", time: event.completed_at },
    { label: "Departed", time: event.departed_at },
  ].filter((t) => t.time);

  // When a contract is selected, auto-select its vendor
  function handleContractChange(contractId: string) {
    setSelectedContract(contractId);
    const contract = contracts.find((c) => c.id === contractId);
    if (contract) setSelectedVendor(contract.vendor_org_id);
  }

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
            {timeline.length === 0 ? (
              <p className="text-sm text-gray-400">No timeline events yet.</p>
            ) : (
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
            )}
          </div>

          {/* Assign & Dispatch Panel */}
          {showAssignPanel && (
            <div className="bg-white rounded-xl border-2 border-brand-300 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign & Dispatch</h3>
              <div className="space-y-4">
                {contracts.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Contract</label>
                    <select value={selectedContract} onChange={(e) => handleContractChange(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none">
                      <option value="">Select contract...</option>
                      {contracts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.contract_type.replace(/_/g, " ")} — ${c.monthly_cost}/mo
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none">
                    <option value="">Select vendor...</option>
                    {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                  <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                    disabled={!selectedVendor}>
                    <option value="">{selectedVendor ? "Select technician..." : "Select vendor first"}</option>
                    {technicians.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                  {selectedVendor && technicians.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">No technicians found for this vendor. They can be added in the Supabase dashboard.</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  {event.status === "open" && (
                    <button onClick={handleAssignAndDispatch} disabled={assigning || !selectedVendor}
                      className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                      {assigning ? "Dispatching..." : "Assign & Dispatch"}
                    </button>
                  )}
                  <button onClick={handleAssignOnly} disabled={assigning || !selectedVendor}
                    className="border border-brand-600 text-brand-600 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-50 transition-colors disabled:opacity-50">
                    {assigning ? "Saving..." : "Save Assignment"}
                  </button>
                  <button onClick={() => setShowAssignPanel(false)}
                    className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Assignment</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Vendor</dt>
                <dd className={`${vendor?.name ? "text-gray-900" : "text-orange-500"}`}>
                  {vendor?.name ?? "Not assigned"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Technician</dt>
                <dd className={`${tech?.full_name ? "text-gray-900" : "text-orange-500"}`}>
                  {tech?.full_name ?? "Not assigned"}
                </dd>
              </div>
              {event.response_time_min && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Response Time</dt>
                  <dd className="text-gray-900 font-medium">{event.response_time_min} min</dd>
                </div>
              )}
            </dl>
            {event.status !== "completed" && event.status !== "cancelled" && !showAssignPanel && (
              <button onClick={() => setShowAssignPanel(true)}
                className="mt-4 w-full bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {vendor?.name ? "Reassign" : "Assign Vendor & Tech"}
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Status Actions</h3>
            <div className="space-y-2">
              {event.status === "open" && !showAssignPanel && (
                <button onClick={() => setShowAssignPanel(true)} className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Assign & Dispatch
                </button>
              )}
              {event.status === "dispatched" && (
                <button onClick={() => updateStatus("in_progress")} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Technician Arrived
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
