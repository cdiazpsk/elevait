import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import { useSupabaseQuery } from "../../hooks/useSupabaseQuery";

interface ContractRow {
  id: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  monthly_cost: number | null;
  is_active: boolean;
  max_response_min: number | null;
  building: { name: string } | null;
  vendor: { name: string } | null;
}

export default function ContractsPage() {
  const navigate = useNavigate();
  const { data: contracts, loading } = useSupabaseQuery<ContractRow>({
    table: "service_contracts",
    select: "id, contract_type, start_date, end_date, monthly_cost, is_active, max_response_min, building:buildings(name), vendor:organizations!vendor_org_id(name)",
    order: { column: "start_date" },
  });

  return (
    <div>
      <PageHeader title="Service Contracts" description="Manage vendor contracts and SLAs" />
      <DataTable
        columns={[
          { key: "building", header: "Building", render: (c) => <span className="font-medium text-gray-900">{(c.building as any)?.name ?? "—"}</span> },
          { key: "vendor", header: "Vendor", render: (c) => (c.vendor as any)?.name ?? "—" },
          { key: "contract_type", header: "Type", render: (c) => <span className="capitalize">{c.contract_type.replace(/_/g, " ")}</span> },
          { key: "monthly_cost", header: "Monthly Cost", render: (c) => c.monthly_cost ? `$${c.monthly_cost.toLocaleString()}` : "—" },
          { key: "max_response_min", header: "SLA (min)", className: "text-center", render: (c) => c.max_response_min ?? "—" },
          { key: "dates", header: "Period", render: (c) => `${new Date(c.start_date).toLocaleDateString()} — ${new Date(c.end_date).toLocaleDateString()}` },
          { key: "is_active", header: "Status", render: (c) => <StatusBadge status={c.is_active ? "operational" : "offline"} /> },
        ]}
        data={contracts}
        loading={loading}
        emptyMessage="No contracts found."
      />
    </div>
  );
}
