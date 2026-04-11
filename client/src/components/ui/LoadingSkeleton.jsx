export default function LoadingSkeleton({ rows = 5, type = 'table' }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="glass-card-static p-6">
            <div className="skeleton h-10 w-10 rounded-xl mb-4" />
            <div className="skeleton h-8 w-24 mb-2" />
            <div className="skeleton h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass-card-static p-4 space-y-3">
      <div className="skeleton h-10 w-full rounded-lg" />
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="skeleton h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}
