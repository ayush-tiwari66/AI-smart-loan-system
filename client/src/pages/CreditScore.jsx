import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Shield, AlertTriangle, ChevronUp, ChevronDown, Minus, Info } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import api from '../utils/api';
import GlowCard from '../components/ui/GlowCard';
import RiskBadge from '../components/ui/RiskBadge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

export default function CreditScore() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/credit/my-score').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto"><LoadingSkeleton type="cards" /></div>
    </div>
  );

  const latest = data?.latest;
  const history = (data?.history || []).map(h => ({
    date: new Date(h.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    score: h.score
  })).reverse();

  if (!latest) return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <GlowCard hover={false} className="py-16">
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Credit Score Yet</h2>
          <p className="text-gray-400 mb-6">Submit a loan application to get your AI-powered credit score analysis.</p>
          <a href="/apply" className="btn-neon">Apply for Loan</a>
        </GlowCard>
      </div>
    </div>
  );

  const score = latest.score;
  const scoreColor = score >= 750 ? '#00FFA3' : score >= 650 ? '#F5C542' : '#FF4D6A';
  const scoreLabel = score >= 750 ? 'Excellent' : score >= 650 ? 'Good' : score >= 500 ? 'Fair' : 'Poor';

  const gaugeData = [{ name: 'Score', value: score, fill: scoreColor }];

  const factors = latest.factors || [];

  const tips = score >= 750
    ? ['Maintain your excellent score by continuing timely payments', 'Consider diversifying credit types for even better rates', 'Your score qualifies you for premium loan products']
    : score >= 650
    ? ['Pay all EMIs on time to boost your score', 'Reduce credit card utilization below 30%', 'Avoid applying for multiple loans simultaneously']
    : ['Focus on clearing overdue payments immediately', 'Keep credit utilization below 30%', 'Build a longer credit history with steady repayments', 'Avoid taking new loans until score improves'];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="particle-bg" />
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold">Your Credit Score</h1>
          <p className="text-gray-400 mt-1">AI-powered credit analysis with detailed factor breakdown</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Score Gauge */}
          <GlowCard hover={false} className="text-center py-8">
            <p className="text-sm text-gray-400 mb-2">CIBIL Score Equivalent</p>
            <div className="relative w-48 h-48 mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" startAngle={225} endAngle={-45} data={gaugeData} barSize={12}>
                  <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={6} max={900} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black" style={{ color: scoreColor }}>{score}</span>
                <span className="text-sm font-medium mt-1" style={{ color: scoreColor }}>{scoreLabel}</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
              <span>300 <span className="text-danger">Poor</span></span>
              <span>500 <span className="text-gold">Fair</span></span>
              <span>750 <span className="text-neon-green">Excellent</span></span>
              <span>900</span>
            </div>
            <div className="mt-4">
              <RiskBadge level={latest.risk_level} />
            </div>
          </GlowCard>

          {/* Score History */}
          <GlowCard hover={false} className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-green" /> Score History
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FFA3" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00FFA3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis domain={[300, 900]} stroke="#666" fontSize={12} />
                <Tooltip contentStyle={{ background: '#141B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="score" stroke="#00FFA3" strokeWidth={2} fill="url(#histGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </GlowCard>
        </div>

        {/* Factor Breakdown */}
        <GlowCard hover={false} className="mb-8">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-neon-green" /> Score Factor Breakdown
          </h3>
          <div className="space-y-4">
            {factors.map((factor, i) => (
              <motion.div key={factor.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <ImpactIcon impact={factor.impact} />
                    <div>
                      <span className="font-medium">{factor.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({factor.weight})</span>
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${factor.score >= 75 ? 'text-neon-green' : factor.score >= 50 ? 'text-gold' : 'text-danger'}`}>
                    {factor.score}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.score}%` }}
                    transition={{ duration: 1, delay: i * 0.15 }}
                    className="h-full rounded-full"
                    style={{ background: factor.score >= 75 ? '#00FFA3' : factor.score >= 50 ? '#F5C542' : '#FF4D6A' }}
                  />
                </div>
                <p className="text-sm text-gray-400">{factor.description}</p>
              </motion.div>
            ))}
          </div>
        </GlowCard>

        {/* Tips */}
        <GlowCard hover={false}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-gold" /> Score Improvement Tips
          </h3>
          <div className="space-y-3">
            {tips.map((tip, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                <div className="w-6 h-6 rounded-full bg-neon-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-neon-green text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-sm text-gray-300">{tip}</p>
              </motion.div>
            ))}
          </div>
        </GlowCard>
      </div>
    </div>
  );
}

function ImpactIcon({ impact }) {
  if (impact === 'positive') return <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center"><ChevronUp className="w-4 h-4 text-neon-green" /></div>;
  if (impact === 'negative') return <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center"><ChevronDown className="w-4 h-4 text-danger" /></div>;
  return <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center"><Minus className="w-4 h-4 text-gold" /></div>;
}
