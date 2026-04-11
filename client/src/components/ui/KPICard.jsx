import { motion } from 'framer-motion';
import CountUpPkg from 'react-countup';
const CountUp = CountUpPkg.default ? CountUpPkg.default : CountUpPkg;
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ title, value, prefix = '', suffix = '', icon: Icon, trend, trendValue, color = 'green', delay = 0 }) {
  const colors = {
    green: { bg: 'from-neon-green/20 to-neon-green/5', text: 'text-neon-green', icon: 'bg-neon-green/15 text-neon-green' },
    gold: { bg: 'from-gold/20 to-gold/5', text: 'text-gold', icon: 'bg-gold/15 text-gold' },
    danger: { bg: 'from-danger/20 to-danger/5', text: 'text-danger', icon: 'bg-danger/15 text-danger' },
    blue: { bg: 'from-blue-400/20 to-blue-400/5', text: 'text-blue-400', icon: 'bg-blue-400/15 text-blue-400' },
  };

  const c = colors[color] || colors.green;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="kpi-card group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${c.icon} transition-all group-hover:scale-110`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-neon-green/10 text-neon-green' : 'bg-danger/10 text-danger'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold mb-1 ${c.text}`}>
        {prefix}<CountUp end={typeof value === 'number' ? value : 0} duration={2} separator="," />{suffix}
      </div>
      <p className="text-sm text-gray-400">{title}</p>
    </motion.div>
  );
}
