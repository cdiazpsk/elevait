import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import { useSupabaseQuery } from "../../hooks/useSupabaseQuery";

interface ElevatorRow {
  id: string;
  car_number: string;
  manufacturer: string | null;
  model: string | null;
  status: string;
  iot_device_id: string | null;
  building: { name: string } | null;
}

export default function ElevatorsListPage() {
  const navigate = useNavigate();
  const { data: elevators, loading } = useSupabaseQuery<ElevatorRow>({
    table: "elevators",
    select: "id, car_number, manufacturer, model, status, iot_device_id, building:buildings(name)",
    order: { column: "created_at" },
  });

  return (
    <div>
      <PageHeader
        title="Elevators"
        description="All elevators across your portfolio"
        action={{ label: "+ Add Elevator", to: "/elevators/new" }}
      />
      <DataTable
        columns={[
          { key: "car_number", header: "Car", render: (e) => <span className="font-medium text-gray-900">{e.car_number}</span> },
          { key: "building", header: "Building", render: (e) => (e.building as any)?.name ?? "—" },
          { key: "manufacturer", header: "Manufacturer", render: (e) => e.manufacturer ?? "—" },
          { key: "model", header: "Model", render: (e) => e.model ?? "—" },
          { key: "status", header: "Status", render: (e) => <StatusBadge status={e.status} /> },
          { key: "iot_device_id", header: "IoT", render: (e) => e.iot_device_id ? <span className="text-green-600 text-xs">Connected</span> : <span className="text-gray-400 text-xs">None</span> },
        ]}
        data={elevators}
        loading={loading}
        onRowClick={(e) => navigate(`/elevators/${e.id}`)}
      />
    </div>
  );
}
