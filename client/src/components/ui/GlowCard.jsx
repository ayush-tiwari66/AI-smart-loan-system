import { motion } from 'framer-motion';

export default function GlowCard({ children, className = '', hover = true, glow = 'green', delay = 0, ...props }) {
  const glowColors = {
    green: 'hover:border-neon-green/20 hover:shadow-glow-green-sm',
    gold: 'hover:border-gold/20 hover:shadow-glow-gold',
    danger: 'hover:border-danger/20 hover:shadow-glow-danger',
    none: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`glass-card p-6 ${hover ? glowColors[glow] || glowColors.green : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
