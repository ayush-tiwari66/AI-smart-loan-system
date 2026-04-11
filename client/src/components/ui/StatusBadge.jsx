export default function StatusBadge({ status }) {
  const config = {
    pending: 'bg-gold/15 text-gold border-gold/30',
    approved: 'bg-neon-green/15 text-neon-green border-neon-green/30',
    rejected: 'bg-danger/15 text-danger border-danger/30',
  };

  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config[status] || config.pending}`}>
      {labels[status] || status}
    </span>
  );
}
