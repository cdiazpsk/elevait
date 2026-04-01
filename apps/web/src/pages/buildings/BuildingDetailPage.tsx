import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import { useSupabaseRecord, useSupabaseQuery } from "../../hooks/useSupabaseQuery";

interface Building {
  id: string;
  name: string;
  address: string;
  floors: number | null;
  geofence_radius_m: number;
  timezone: string;
  after_hours_start: string | null;
  after_hours_end: string | null;
}

interface ElevatorRow {
  id: string;
  car_number: string;
  manufacturer: string | null;
  model: string | null;
  status: string;
  iot_device_id: string | null;
}

export default function BuildingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: building, loading } = useSupabaseRecord<Building>("buildings", id);
  const { data: elevators, loading: elevatorsLoading } = useSupabaseQuery<ElevatorRow>({
    table: "elevators",
    select: "id, car_number, manufacturer, model, status, iot_device_id",
    filters: { building_id: id },
    order: { column: "car_number", ascending: true },
    enabled: !!id,
  });

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!building) return <div className="text-center py-12 text-gray-500">Building not found</div>;

  return (
    <div>
      <PageHeader
        title={building.name}
        description={building.address}
        breadcrumbs={[
          { label: "Buildings", to: "/buildings" },
          { label: building.name },
        ]}
        action={{ label: "Edit Building", to: `/buildings/${id}/edit` }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Floors</dt>
              <dd className="text-gray-900 font-medium">{building.floors ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Geofence</dt>
              <dd className="text-gray-900 font-medium">{building.geofence_radius_m}m radius</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Timezone</dt>
              <dd className="text-gray-900 font-medium">{building.timezone}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">After Hours</h3>
          {building.after_hours_start && building.after_hours_end ? (
            <p className="text-sm text-gray-900">
              {building.after_hours_start} — {building.after_hours_end}
            </p>
          ) : (
            <p className="text-sm text-gray-400">Not configured</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Fleet Summary</h3>
          <p className="text-3xl font-bold text-gray-900">{elevators.length}</p>
          <p className="text-sm text-gray-500">elevators</p>
          <div className="flex gap-2 mt-3">
            {["operational", "out_of_order", "maintenance"].map((s) => {
              const count = elevators.filter((e) => e.status === s).length;
              if (count === 0) return null;
              return <StatusBadge key={s} status={s} />;
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Elevators</h2>
        <Link to={`/elevators/new?building_id=${id}`} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
          + Add Elevator
        </Link>
      </div>

      <DataTable
        columns={[
          { key: "car_number", header: "Car", render: (e) => <span className="font-medium text-gray-900">{e.car_number}</span> },
          { key: "manufacturer", header: "Manufacturer", render: (e) => e.manufacturer ?? "—" },
          { key: "model", header: "Model", render: (e) => e.model ?? "—" },
          { key: "status", header: "Status", render: (e) => <StatusBadge status={e.status} /> },
          { key: "iot_device_id", header: "IoT Device", render: (e) => e.iot_device_id ? <code className="text-xs bg-gray-100 px-2 py-1 rounded">{e.iot_device_id}</code> : "—" },
        ]}
        data={elevators}
        loading={elevatorsLoading}
        onRowClick={(e) => navigate(`/elevators/${e.id}`)}
        emptyMessage="No elevators in this building yet."
      />
    </div>
  );
}
