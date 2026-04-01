import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import { useSupabaseQuery } from "../../hooks/useSupabaseQuery";

interface BuildingRow {
  id: string;
  name: string;
  address: string;
  floors: number | null;
  geofence_radius_m: number;
  timezone: string;
  elevator_count?: number;
}

export default function BuildingsListPage() {
  const navigate = useNavigate();
  const { data: buildings, loading } = useSupabaseQuery<BuildingRow>({
    table: "buildings",
    select: "id, name, address, floors, geofence_radius_m, timezone",
    order: { column: "name", ascending: true },
  });

  return (
    <div>
      <PageHeader
        title="Buildings"
        description="Manage your elevator portfolio"
        action={{ label: "+ Add Building", to: "/buildings/new" }}
      />
      <DataTable
        columns={[
          { key: "name", header: "Building Name", render: (b) => <span className="font-medium text-gray-900">{b.name}</span> },
          { key: "address", header: "Address" },
          { key: "floors", header: "Floors", className: "text-center", render: (b) => b.floors ?? "—" },
          { key: "geofence_radius_m", header: "Geofence", className: "text-center", render: (b) => `${b.geofence_radius_m}m` },
          { key: "timezone", header: "Timezone", render: (b) => b.timezone.split("/")[1]?.replace("_", " ") || b.timezone },
        ]}
        data={buildings}
        loading={loading}
        onRowClick={(b) => navigate(`/buildings/${b.id}`)}
        emptyMessage="No buildings yet. Add your first building to get started."
      />
    </div>
  );
}
