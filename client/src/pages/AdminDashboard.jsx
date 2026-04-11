import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, IndianRupee, BarChart3, Search, Filter, CheckCircle2, XCircle, Clock, Eye, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import api from '../utils/api';
import KPICard from '../components/ui/KPICard';
import StatusBadge from '../components/ui/StatusBadge';
import RiskBadge from '../components/ui/RiskBadge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import GlowCard from '../components/ui/GlowCard';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#00FFA3', '#F5C542', '#FF4D6A', '#FF6B6B'];
const BAR_COLORS = ['#00FFA3', '#00CC82', '#F5C542', '#FF4D6A'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchAnalytics(); }, []);
  useEffect(() => { fetchApplications(); }, [filter, search, page]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/applications?status=${filter}&search=${search}&page=${page}`);
      setApplications(res.data.applications || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/applications/${id}`, {
        status,
        admin_notes: status === 'approved' ? 'Application verified and approved by admin.' : 'Application rejected after risk review.'
      });
      toast.success(`Application ${status}!`);
      fetchApplications();
      fetchAnalytics();
      setSelectedApp(null);
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const kpis = analytics?.kpis || {};
  const riskData = analytics?.riskDistribution
    ? Object.entries(analytics.riskDistribution).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
    : [];
  const monthlyData = analytics?.monthlyTrends || [];
  const scoreDistData = analytics?.scoreDistribution
    ? Object.entries(analytics.scoreDistribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="particle-bg" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-neon-green" /> Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Manage applications, monitor analytics, and review risk</p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard title="Total Applications" value={kpis.totalApplications || 0} icon={Users} color="blue" />
          <KPICard title="Approval Rate" value={kpis.approvalRate || 0} suffix="%" icon={CheckCircle2} color="green" trend="up" trendValue="+3.2%" />
          <KPICard title="Avg Credit Score" value={kpis.avgCreditScore || 0} icon={BarChart3} color="gold" />
          <KPICard title="Total Disbursed" value={Math.round((kpis.totalDisbursed || 0) / 100000)} prefix="₹" suffix="L" icon={IndianRupee} color="green" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Trends */}
          <GlowCard hover={false} className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#666" fontSize={11} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip contentStyle={{ background: '#141B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="approved" fill="#00FFA3" radius={[4, 4, 0, 0]} name="Approved" />
                <Bar dataKey="rejected" fill="#FF4D6A" radius={[4, 4, 0, 0]} name="Rejected" />
                <Bar dataKey="total" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </GlowCard>

          {/* Risk Distribution */}
          <GlowCard hover={false}>
            <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {riskData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#141B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {riskData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-400">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>

        {/* Score Distribution */}
        <GlowCard hover={false} className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Credit Score Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scoreDistData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip contentStyle={{ background: '#141B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Applications">
                {scoreDistData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>

        {/* Applications Table */}
        <GlowCard hover={false}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold">All Applications</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name or PAN..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="input-dark pl-10 !py-2 text-sm sm:w-64"
                />
              </div>
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                  <button key={f} onClick={() => { setFilter(f); setPage(1); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === f ? 'bg-neon-green/15 text-neon-green' : 'text-gray-400 hover:text-white'}`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? <LoadingSkeleton rows={8} /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/5">
                    <th className="text-left py-3 px-3">Applicant</th>
                    <th className="text-left py-3 px-3">Purpose</th>
                    <th className="text-right py-3 px-3">Amount</th>
                    <th className="text-center py-3 px-3">Score</th>
                    <th className="text-center py-3 px-3">Risk</th>
                    <th className="text-center py-3 px-3">Status</th>
                    <th className="text-center py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, i) => (
                    <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-medium">{app.full_name}</p>
                          <p className="text-xs text-gray-500">{app.users?.email || app.pan_number}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-400">{app.loan_purpose}</td>
                      <td className="py-3 px-3 text-right font-medium">₹{parseFloat(app.loan_amount).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-center font-medium text-neon-green">{app.credit_score}</td>
                      <td className="py-3 px-3 text-center"><RiskBadge level={app.risk_level} /></td>
                      <td className="py-3 px-3 text-center"><StatusBadge status={app.status} /></td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setSelectedApp(app)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          {app.status === 'pending' && (
                            <>
                              <button onClick={() => handleAction(app.id, 'approved')}
                                disabled={actionLoading === app.id}
                                className="p-1.5 rounded-lg hover:bg-neon-green/10 text-neon-green/70 hover:text-neon-green transition-all" title="Approve">
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleAction(app.id, 'rejected')}
                                disabled={actionLoading === app.id}
                                className="p-1.5 rounded-lg hover:bg-danger/10 text-danger/70 hover:text-danger transition-all" title="Reject">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {applications.length === 0 && (
                <div className="text-center py-12 text-gray-500">No applications found</div>
              )}
            </div>
          )}
        </GlowCard>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedApp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedApp(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="glass-card p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Application Details</h3>
                  <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-white/5 rounded-lg"><X className="w-5 h-5" /></button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <DetailRow label="Full Name" value={selectedApp.full_name} />
                  <DetailRow label="Age" value={selectedApp.age} />
                  <DetailRow label="Phone" value={selectedApp.phone} />
                  <DetailRow label="PAN" value={selectedApp.pan_number} />
                  <DetailRow label="Employment" value={selectedApp.employment_type} />
                  <DetailRow label="Company" value={selectedApp.company_name} />
                  <DetailRow label="Designation" value={selectedApp.designation} />
                  <DetailRow label="Experience" value={`${selectedApp.years_employed} years`} />
                  <DetailRow label="Annual Income" value={`₹${parseFloat(selectedApp.annual_income).toLocaleString('en-IN')}`} />
                  <DetailRow label="Monthly Expenses" value={`₹${parseFloat(selectedApp.monthly_expenses).toLocaleString('en-IN')}`} />
                  <DetailRow label="Loan Amount" value={`₹${parseFloat(selectedApp.loan_amount).toLocaleString('en-IN')}`} />
                  <DetailRow label="Tenure" value={`${selectedApp.loan_tenure} months`} />
                  <DetailRow label="EMI" value={`₹${parseFloat(selectedApp.emi).toLocaleString('en-IN')}`} />
                  <DetailRow label="Purpose" value={selectedApp.loan_purpose} />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="glass-card-static p-4 rounded-xl text-center">
                    <p className="text-xs text-gray-400 mb-1">Credit Score</p>
                    <p className="text-2xl font-bold text-neon-green">{selectedApp.credit_score}</p>
                  </div>
                  <div className="glass-card-static p-4 rounded-xl text-center">
                    <p className="text-xs text-gray-400 mb-1">Risk Level</p>
                    <div className="mt-1"><RiskBadge level={selectedApp.risk_level} /></div>
                  </div>
                  <div className="glass-card-static p-4 rounded-xl text-center">
                    <p className="text-xs text-gray-400 mb-1">Approval %</p>
                    <p className="text-2xl font-bold text-gold">{selectedApp.approval_probability}%</p>
                  </div>
                </div>

                {selectedApp.fraud_flags?.length > 0 && (
                  <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 mb-6">
                    <p className="text-danger font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Fraud Alerts</p>
                    {selectedApp.fraud_flags.map((f, i) => (
                      <p key={i} className="text-sm text-gray-400">• {f.message} ({f.severity})</p>
                    ))}
                  </div>
                )}

                {selectedApp.status === 'pending' && (
                  <div className="flex gap-3">
                    <button onClick={() => handleAction(selectedApp.id, 'approved')} className="btn-neon flex-1 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handleAction(selectedApp.id, 'rejected')} className="flex-1 px-4 py-3 rounded-xl bg-danger/15 text-danger border border-danger/30 font-semibold hover:bg-danger/25 transition-all flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-sm">{value || '-'}</p>
    </div>
  );
}

function AlertTriangle(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  );
}
