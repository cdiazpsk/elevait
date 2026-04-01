import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PageHeader from "../../components/ui/PageHeader";

interface ElevatorOption {
  id: string;
  car_number: string;
  building: { name: string } | null;
}

export default function EventFormPage() {
  const navigate = useNavigate();

  const [elevatorId, setElevatorId] = useState("");
  const [eventType, setEventType] = useState("callback");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");
  const [elevators, setElevators] = useState<ElevatorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("elevators")
      .select("id, car_number, building:buildings(name)")
      .then(({ data }) => {
        if (data) setElevators(data as unknown as ElevatorOption[]);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await supabase.from("service_events").insert({
      elevator_id: elevatorId,
      event_type: eventType,
      priority,
      status: "reported",
      description,
      reported_at: new Date().toISOString(),
    });

    setLoading(false);
    if (err) setError(err.message);
    else navigate("/events");
  }

  return (
    <div>
      <PageHeader
        title="Report Service Event"
        breadcrumbs={[
          { label: "Service Events", to: "/events" },
          { label: "New" },
        ]}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Elevator</label>
          <select required value={elevatorId} onChange={(e) => setElevatorId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none">
            <option value="">Select elevator...</option>
            {elevators.map((el) => (
              <option key={el.id} value={el.id}>
                {(el.building as any)?.name} — {el.car_number}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none">
              <option value="callback">Callback</option>
              <option value="entrapment">Entrapment</option>
              <option value="pm_visit">Preventive Maintenance</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
            placeholder="Describe the issue or service needed..." />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Submitting..." : "Report Event"}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="border border-gray-300 text-gray-700 font-medium py-2.5 px-6 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
