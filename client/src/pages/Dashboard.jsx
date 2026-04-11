import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, FileText, Calculator, TrendingUp, Plus, IndianRupee, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import KPICard from '../components/ui/KPICard';
import StatusBadge from '../components/ui/StatusBadge';
import RiskBadge from '../components/ui/RiskBadge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import GlowCard from '../components/ui/GlowCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [creditData, setCreditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emiCalc, setEmiCalc] = useState({ principal: 500000, rate: 10, tenure: 36 });
  const [emiResult, setEmiResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansRes, creditRes] = await Promise.all([
        api.get('/loans/my-loans'),
        api.get('/credit/my-score'),
      ]);
      setLoans(loansRes.data.loans || []);
      setCreditData(creditRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateEmi = async () => {
    try {
      const res = await api.post('/loans/calculate-emi', emiCalc);
      setEmiResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { calculateEmi(); }, [emiCalc]);

  const approved = loans.filter(l => l.status === 'approved').length;
  const pending = loans.filter(l => l.status === 'pending').length;
  const totalAmount = loans.filter(l => l.status === 'approved').reduce((s, l) => s + (l.loan_amount || 0), 0);
  const latestScore = creditData?.latest?.score || 0;

  const scoreHistory = (creditData?.history || []).map((h, i) => ({
    month: new Date(h.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    score: h.score
  })).reverse();

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <LoadingSkeleton type="cards" />
          <LoadingSkeleton rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="particle-bg" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-gray-400 mt-1">Here's your financial dashboard</p>
          </div>
          <Link to="/apply" className="btn-neon flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Application
          </Link>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard title="Credit Score" value={latestScore} icon={BarChart3} color="green" trend="up" trendValue="+12" />
          <KPICard title="Total Applications" value={loans.length} icon={FileText} color="blue" />
          <KPICard title="Approved Loans" value={approved} icon={CheckCircle2} color="green" />
          <KPICard title="Total Disbursed" value={Math.round(totalAmount / 100000)} prefix="₹" suffix="L" icon={IndianRupee} color="gold" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Credit Score Chart */}
          <GlowCard className="lg:col-span-2" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Credit Score Trend</h3>
              <Link to="/credit-score" className="text-sm text-neon-green hover:underline">View Details →</Link>
            </div>
            {scoreHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={scoreHistory}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00FFA3" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#00FFA3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#666" fontSize={12} />
                  <YAxis domain={[300, 900]} stroke="#666" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#141B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="score" stroke="#00FFA3" strokeWidth={2} fill="url(#scoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">No score history yet</div>
            )}
          </GlowCard>

          {/* EMI Calculator */}
          <GlowCard hover={false}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-neon-green" /> EMI Calculator
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white font-medium">₹{emiCalc.principal.toLocaleString('en-IN')}</span>
                </div>
                <input type="range" min="50000" max="5000000" step="50000" value={emiCalc.principal}
                  onChange={e => setEmiCalc({ ...emiCalc, principal: parseInt(e.target.value) })}
                  className="w-full accent-neon-green" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Rate</span>
                  <span className="text-white font-medium">{emiCalc.rate}% p.a.</span>
                </div>
                <input type="range" min="5" max="24" step="0.5" value={emiCalc.rate}
                  onChange={e => setEmiCalc({ ...emiCalc, rate: parseFloat(e.target.value) })}
                  className="w-full accent-neon-green" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Tenure</span>
                  <span className="text-white font-medium">{emiCalc.tenure} months</span>
                </div>
                <input type="range" min="6" max="120" step="6" value={emiCalc.tenure}
                  onChange={e => setEmiCalc({ ...emiCalc, tenure: parseInt(e.target.value) })}
                  className="w-full accent-neon-green" />
              </div>
              {emiResult && (
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Monthly EMI</span>
                    <span className="text-neon-green font-bold text-lg">₹{emiResult.emi?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Interest</span>
                    <span className="text-gold">₹{emiResult.totalInterest?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Payment</span>
                    <span className="text-white">₹{emiResult.totalPayment?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>
          </GlowCard>
        </div>

        {/* Loan History */}
        <GlowCard hover={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Application History</h3>
            <span className="text-sm text-gray-400">{loans.length} applications</span>
          </div>
          {loans.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No applications yet</p>
              <Link to="/apply" className="btn-neon">Apply Now</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/5">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Purpose</th>
                    <th className="text-right py-3 px-4">Amount</th>
                    <th className="text-right py-3 px-4">EMI</th>
                    <th className="text-center py-3 px-4">Score</th>
                    <th className="text-center py-3 px-4">Risk</th>
                    <th className="text-center py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan, i) => (
                    <motion.tr key={loan.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-gray-400">{new Date(loan.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="py-3 px-4">{loan.loan_purpose}</td>
                      <td className="py-3 px-4 text-right font-medium">₹{parseFloat(loan.loan_amount).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right text-gray-400">₹{parseFloat(loan.emi).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-center font-medium text-neon-green">{loan.credit_score}</td>
                      <td className="py-3 px-4 text-center"><RiskBadge level={loan.risk_level} /></td>
                      <td className="py-3 px-4 text-center"><StatusBadge status={loan.status} /></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlowCard>
      </div>
    </div>
  );
}
