import { useSupabaseQuery } from "../../hooks/useSupabaseQuery";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import { useNavigate } from "react-router-dom";

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  audit_status: string;
  submitted_at: string;
  period_start: string;
  period_end: string;
  contract: { building: { name: string } | null } | null;
  vendor: { name: string } | null;
}

export default function InvoicesListPage() {
  const navigate = useNavigate();
  const { data: invoices, loading } = useSupabaseQuery<Invoice>({
    table: "invoices",
    select: "id, invoice_number, total_amount, audit_status, submitted_at, period_start, period_end, contract:service_contracts(building:buildings(name)), vendor:organizations!vendor_org_id(name)",
    order: { column: "submitted_at" },
  });

  const columns = [
    {
      key: "invoice_number" as const,
      header: "Invoice #",
      render: (inv: Invoice) => (
        <span className="font-medium text-gray-900">{inv.invoice_number}</span>
      ),
    },
    {
      key: "contract" as const,
      header: "Building",
      render: (inv: Invoice) => (
        <span className="text-gray-600">{(inv.contract as any)?.building?.name || "—"}</span>
      ),
    },
    {
      key: "vendor" as const,
      header: "Vendor",
      render: (inv: Invoice) => (
        <span className="text-gray-600">{(inv.vendor as any)?.name || "—"}</span>
      ),
    },
    {
      key: "period_start" as const,
      header: "Period",
      render: (inv: Invoice) => (
        <span className="text-gray-600 text-sm">
          {new Date(inv.period_start).toLocaleDateString()} — {new Date(inv.period_end).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "total_amount" as const,
      header: "Amount",
      render: (inv: Invoice) => (
        <span className="font-medium text-gray-900">
          ${inv.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
        </span>
      ),
    },
    {
      key: "audit_status" as const,
      header: "Audit Status",
      render: (inv: Invoice) => <StatusBadge status={inv.audit_status} />,
    },
    {
      key: "submitted_at" as const,
      header: "Submitted",
      render: (inv: Invoice) => (
        <span className="text-gray-500 text-sm">{new Date(inv.submitted_at).toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Invoices" description="Review and audit vendor invoices" />
      <DataTable columns={columns} data={invoices} loading={loading} emptyMessage="No invoices found" onRowClick={(inv) => navigate(`/invoices/${inv.id}`)} />
    </div>
  );
}
