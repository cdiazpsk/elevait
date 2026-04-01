import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PageHeader from "../../components/ui/PageHeader";

export default function ElevatorFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [buildingId, setBuildingId] = useState(searchParams.get("building_id") || "");
  const [carNumber, setCarNumber] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [controllerType, setControllerType] = useState("");
  const [iotDeviceId, setIotDeviceId] = useState("");
  const [status, setStatus] = useState("operational");
  const [floorsServed, setFloorsServed] = useState("");
  const [installDate, setInstallDate] = useState("");
  const [lastInspection, setLastInspection] = useState("");
  const [buildings, setBuildings] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("buildings").select("id, name").then(({ data }) => {
      if (data) setBuildings(data);
    });

    if (id) {
      supabase.from("elevators").select("*").eq("id", id).single().then(({ data }) => {
        if (data) {
          setBuildingId(data.building_id);
          setCarNumber(data.car_number);
          setManufacturer(data.manufacturer || "");
          setModel(data.model || "");
          setControllerType(data.controller_type || "");
          setIotDeviceId(data.iot_device_id || "");
          setStatus(data.status);
          setFloorsServed(data.floors_served?.join(", ") || "");
          setInstallDate(data.install_date || "");
          setLastInspection(data.last_inspection_date || "");
        }
      });
    }
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      building_id: buildingId,
      car_number: carNumber,
      manufacturer: manufacturer || null,
      model: model || null,
      controller_type: controllerType || null,
      iot_device_id: iotDeviceId || null,
      status,
      floors_served: floorsServed ? floorsServed.split(",").map((f) => parseInt(f.trim())).filter((n) => !isNaN(n)) : null,
      install_date: installDate || null,
      last_inspection_date: lastInspection || null,
    };

    let result;
    if (isEdit) {
      result = await supabase.from("elevators").update(payload).eq("id", id);
    } else {
      result = await supabase.from("elevators").insert(payload);
    }

    setLoading(false);
    if (result.error) setError(result.error.message);
    else navigate(buildingId ? `/buildings/${buildingId}` : "/elevators");
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Elevator" : "Add Elevator"}
        breadcrumbs={[
          { label: "Elevators", to: "/elevators" },
          { label: isEdit ? "Edit" : "New" },
        ]}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
          <select required value={buildingId} onChange={(e) => setBuildingId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none">
            <option value="">Select building...</option>
            {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Car Number</label>
            <input type="text" required value={carNumber} onChange={(e) => setCarNumber(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              placeholder="e.g. CAR-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none">
              <option value="operational">Operational</option>
              <option value="out_of_order">Out of Order</option>
              <option value="maintenance">Maintenance</option>
              <option value="modernization">Modernization</option>
              <option value="decommissioned">Decommissioned</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
            <input type="text" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              placeholder="e.g. Otis, ThyssenKrupp" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input type="text" value={model} onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              placeholder="e.g. Gen2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Controller Type</label>
            <input type="text" value={controllerType} onChange={(e) => setControllerType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              placeholder="e.g. Compass 360" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IoT Device ID</label>
            <input type="text" value={iotDeviceId} onChange={(e) => setIotDeviceId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              placeholder="Optional device identifier" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Install Date</label>
            <input type="date" value={installDate} onChange={(e) => setInstallDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Inspection</label>
            <input type="date" value={lastInspection} onChange={(e) => setLastInspection(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Floors Served</label>
          <input type="text" value={floorsServed} onChange={(e) => setFloorsServed(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
            placeholder="Comma-separated, e.g. 1, 2, 3, 4, 5" />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Saving..." : isEdit ? "Update Elevator" : "Add Elevator"}
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
