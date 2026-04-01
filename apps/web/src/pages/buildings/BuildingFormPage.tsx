import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function BuildingFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    address: "",
    floors: "",
    geofence_radius_m: "150",
    timezone: "America/New_York",
    after_hours_start: "",
    after_hours_end: "",
  });

  useEffect(() => {
    if (!id) return;
    supabase.from("buildings").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        setForm({
          name: data.name,
          address: data.address,
          floors: data.floors?.toString() || "",
          geofence_radius_m: data.geofence_radius_m.toString(),
          timezone: data.timezone,
          after_hours_start: data.after_hours_start || "",
          after_hours_end: data.after_hours_end || "",
        });
      }
    });
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name: form.name,
      address: form.address,
      floors: form.floors ? parseInt(form.floors) : null,
      geofence_radius_m: parseInt(form.geofence_radius_m),
      timezone: form.timezone,
      after_hours_start: form.after_hours_start || null,
      after_hours_end: form.after_hours_end || null,
      organization_id: profile?.organization_id,
      // PostGIS point from address would be geocoded here via Mapbox
      // For now, use a placeholder point
      location: `SRID=4326;POINT(-73.9762 40.7527)`,
    };

    let result;
    if (isEditing) {
      result = await supabase.from("buildings").update(payload).eq("id", id);
    } else {
      result = await supabase.from("buildings").insert(payload);
    }

    setLoading(false);
    if (result.error) setError(result.error.message);
    else navigate(isEditing ? `/buildings/${id}` : "/buildings");
  }

  const timezones = [
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "America/Phoenix", "Pacific/Honolulu", "America/Anchorage",
  ];

  return (
    <div>
      <PageHeader
        title={isEditing ? "Edit Building" : "Add Building"}
        breadcrumbs={[
          { label: "Buildings", to: "/buildings" },
          { label: isEditing ? "Edit" : "New Building" },
        ]}
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Building Name *</label>
            <input name="name" required value={form.name} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" placeholder="Metro Tower One" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input name="address" required value={form.address} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" placeholder="100 Park Ave, New York, NY 10017" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floors</label>
              <input name="floors" type="number" value={form.floors} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" placeholder="42" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geofence Radius (m)</label>
              <input name="geofence_radius_m" type="number" value={form.geofence_radius_m} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select name="timezone" value={form.timezone} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none">
              {timezones.map((tz) => <option key={tz} value={tz}>{tz.replace("_", " ")}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">After Hours Start</label>
              <input name="after_hours_start" type="time" value={form.after_hours_start} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">After Hours End</label>
              <input name="after_hours_end" type="time" value={form.after_hours_end} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t">
          <button type="submit" disabled={loading} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Building"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
