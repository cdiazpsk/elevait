import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useSupabaseRecord } from "../../hooks/useSupabaseQuery";
import { useSupabaseQuery } from "../../hooks/useSupabaseQuery";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import DataTable from "../../components/ui/DataTable";
import { useState } from "react";

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  audit_status: string;
  submitted_at: string;
  period_start: string;
  period_end: string;
  document_url: string | null;
  audit_flags: Record<string, unknown>[] | null;
  contract: { id: string; building: { name: string } | null; contract_type: string } | null;
  vendor: { name: string } | null;
}

interface LineItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit_rate: number;
  amount: number;
  audit_result: string | null;
  service_event: { event_type: string; reported_at: string } | null;
}

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [updating, setUpdating] = useState(false);

  const { data: invoice, loading, refetch } = useSupabaseRecord<Invoice>(
    "invoices",
    id,
    "*, contract:service_contracts(id, contract_type, building:buildings(name)), vendor:organizations!vendor_org_id(name)"
  );

  const { data: lineItems } = useSupabaseQuery<LineItem>({
    table: "invoice_line_items",
    select: "id, category, description, quantity, unit_rate, amount, audit_result, service_event:service_events(event_type, reported_at)",
    filters: { invoice_id: id },
  });

  async function updateAuditStatus(newStatus: string) {
    if (!id) return;
    setUpdating(true);
    await supabase.from("invoices").update({ audit_status: newStatus }).eq("id", id);
    setUpdating(false);
    refetch();
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" /></div>;
  }

  if (!invoice) {
    return <div className="text-center py-12"><p className="text-gray-500">Invoice not found</p><Link to="/invoices" className="text-brand-600 hover:text-brand-700 mt-2 inline-block">Back to invoices</Link></div>;
  }

  const lineItemColumns = [
    {
      key: "category" as const,
      header: "Category",
      render: (item: LineItem) => (
        <span className="text-gray-900 capitalize">{item.category?.replace(/_/g, " ")}</span>
      ),
    },
    {
      key: "description" as const,
      header: "Description",
      render: (item: LineItem) => (
        <span className="text-gray-600">{item.description || "—"}</span>
      ),
    },
    {
      key: "quantity" as const,
      header: "Qty",
      render: (item: LineItem) => <span className="text-gray-600">{item.quantity}</span>,
    },
    {
      key: "unit_rate" as const,
      header: "Rate",
      render: (item: LineItem) => <span className="text-gray-600">${item.unit_rate?.toFixed(2)}</span>,
    },
    {
      key: "amount" as const,
      header: "Amount",
      render: (item: LineItem) => <span className="font-medium text-gray-900">${item.amount?.toFixed(2)}</span>,
    },
    {
      key: "audit_result" as const,
      header: "Audit",
      render: (item: LineItem) => item.audit_result ? <StatusBadge status={item.audit_result} /> : <span className="text-gray-400">Pending</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Invoice ${invoice.invoice_number}`}
        breadcrumbs={[
          { label: "Invoices", to: "/invoices" },
          { label: invoice.invoice_number },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Invoice Details</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Status</dt>
              <dd><StatusBadge status={invoice.audit_status} /></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Total</dt>
              <dd className="text-sm font-semibold text-gray-900">${invoice.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Submitted</dt>
              <dd className="text-sm text-gray-900">{new Date(invoice.submitted_at).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Contract Info</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Building</dt>
              <dd className="text-sm text-gray-900">{(invoice.contract as any)?.building?.name || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Type</dt>
              <dd className="text-sm text-gray-900 capitalize">{(invoice.contract as any)?.contract_type?.replace(/_/g, " ") || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Period</dt>
              <dd className="text-sm text-gray-900">{new Date(invoice.period_start).toLocaleDateString()} — {new Date(invoice.period_end).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Vendor</h3>
          <p className="text-sm text-gray-900 mb-4">{(invoice.vendor as any)?.name || "—"}</p>

          <h3 className="text-sm font-medium text-gray-500 mb-3">Actions</h3>
          <div className="flex flex-col gap-2">
            {invoice.audit_status === "pending" && (
              <button onClick={() => updateAuditStatus("in_review")} disabled={updating}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                Start Review
              </button>
            )}
            {invoice.audit_status === "in_review" && (
              <>
                <button onClick={() => updateAuditStatus("approved")} disabled={updating}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                  Approve
                </button>
                <button onClick={() => updateAuditStatus("flagged")} disabled={updating}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                  Flag Issues
                </button>
                <button onClick={() => updateAuditStatus("disputed")} disabled={updating}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                  Dispute
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h2>
        <DataTable columns={lineItemColumns} data={lineItems} loading={false} emptyMessage="No line items" />
      </div>
    </div>
  );
}
