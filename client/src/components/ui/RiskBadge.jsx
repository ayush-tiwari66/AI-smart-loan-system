export default function RiskBadge({ level }) {
  const config = {
    'Low': 'bg-neon-green/15 text-neon-green border-neon-green/30',
    'Medium': 'bg-gold/15 text-gold border-gold/30',
    'High': 'bg-danger/15 text-danger border-danger/30',
    'Very High': 'bg-red-500/15 text-red-400 border-red-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config[level] || config['Medium']}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        level === 'Low' ? 'bg-neon-green' : level === 'Medium' ? 'bg-gold' : 'bg-danger'
      }`} />
      {level} Risk
    </span>
  );
}
