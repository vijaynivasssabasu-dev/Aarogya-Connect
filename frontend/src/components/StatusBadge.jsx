const STATUS_CONFIG = {
  booked: { className: 'badge-info', label: 'Booked' }, pending_payment: { className: 'badge-warning', label: 'Pending Payment' },
  completed: { className: 'badge-success', label: 'Completed' }, missed: { className: 'badge-danger', label: 'Missed' },
  cancelled: { className: 'badge-gray', label: 'Cancelled' }, rescheduled: { className: 'badge-info', label: 'Rescheduled' },
  success: { className: 'badge-success', label: 'Success' }, created: { className: 'badge-warning', label: 'Pending' },
  failed: { className: 'badge-danger', label: 'Failed' }, refunded: { className: 'badge-gray', label: 'Refunded' },
};
export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { className: 'badge-gray', label: status };
  return <span className={config.className}>{config.label}</span>;
}
