const statusColors: Record<string, string> = {
  operational: "bg-green-100 text-green-800",
  out_of_order: "bg-red-100 text-red-800",
  maintenance: "bg-yellow-100 text-yellow-800",
  offline: "bg-gray-100 text-gray-800",
  open: "bg-blue-100 text-blue-800",
  dispatched: "bg-purple-100 text-purple-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  active: "bg-red-100 text-red-800",
  acknowledged: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  auto_resolved: "bg-green-100 text-green-800",
  pending: "bg-gray-100 text-gray-800",
  passed: "bg-green-100 text-green-800",
  flagged: "bg-red-100 text-red-800",
  disputed: "bg-orange-100 text-orange-800",
  approved: "bg-green-100 text-green-800",
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  normal: "bg-blue-100 text-blue-800",
  low: "bg-gray-100 text-gray-800",
  warning: "bg-yellow-100 text-yellow-800",
  info: "bg-blue-100 text-blue-800",
};

export default function StatusBadge({ status }: { status: string }) {
  const colors = statusColors[status] || "bg-gray-100 text-gray-800";
  const label = status.replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors}`}>
      {label}
    </span>
  );
}
