import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Wallet, Briefcase, CreditCard, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import RiskBadge from '../components/ui/RiskBadge';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Income Details', icon: Wallet },
  { id: 3, title: 'Employment', icon: Briefcase },
  { id: 4, title: 'Loan & Credit', icon: CreditCard },
];

const initialForm = {
  full_name: '', age: '', phone: '', address: '', pan_number: '',
  annual_income: '', monthly_expenses: '', existing_debts: '', savings: '',
  employment_type: 'salaried', company_name: '', designation: '', years_employed: '',
  existing_loans: '0', credit_cards: '0', missed_payments: '0',
  loan_amount: '', loan_tenure: '36', loan_purpose: 'Personal Needs',
};

export default function LoanApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = () => {
    const errs = {};
    if (step === 1) {
      if (!form.full_name.trim()) errs.full_name = 'Required';
      if (!form.age || form.age < 18 || form.age > 70) errs.age = 'Age must be 18-70';
      const digits = form.phone.replace(/\D/g, '');
      if (!form.phone.trim()) {
        errs.phone = 'Required';
      } else if (digits.length < 10) {
        errs.phone = 'Valid 10-digit phone number required';
      }
      if (!form.pan_number.trim() || form.pan_number.length !== 10) errs.pan_number = 'Valid 10-digit PAN required';
    } else if (step === 2) {
      if (!form.annual_income || form.annual_income <= 0) errs.annual_income = 'Required';
      if (!form.monthly_expenses || form.monthly_expenses < 0) errs.monthly_expenses = 'Required';
    } else if (step === 3) {
      if (!form.company_name.trim()) errs.company_name = 'Required';
      if (!form.designation.trim()) errs.designation = 'Required';
      if (form.years_employed === '' || form.years_employed < 0) errs.years_employed = 'Required';
    } else if (step === 4) {
      if (!form.loan_amount || form.loan_amount <= 0) errs.loan_amount = 'Required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(4, s + 1)); };
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: parseInt(form.age),
        annual_income: parseFloat(form.annual_income),
        monthly_expenses: parseFloat(form.monthly_expenses),
        existing_debts: parseFloat(form.existing_debts || 0),
        savings: parseFloat(form.savings || 0),
        years_employed: parseInt(form.years_employed),
        existing_loans: parseInt(form.existing_loans),
        credit_cards: parseInt(form.credit_cards),
        missed_payments: parseInt(form.missed_payments),
        loan_amount: parseFloat(form.loan_amount),
        loan_tenure: parseInt(form.loan_tenure),
      };
      const res = await api.post('/loans/apply', payload);
      setResult(res.data);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-neon-green/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-neon-green" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-gray-400 mb-8">Your loan application has been processed by our AI engine.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="glass-card-static p-4 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">Credit Score</p>
                <p className="text-3xl font-bold text-neon-green">{result.creditScore.score}</p>
              </div>
              <div className="glass-card-static p-4 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">Risk Level</p>
                <div className="mt-1"><RiskBadge level={result.creditScore.riskLevel} /></div>
              </div>
              <div className="glass-card-static p-4 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">Approval Chances</p>
                <p className="text-3xl font-bold text-gold">{result.creditScore.approvalProbability}%</p>
              </div>
            </div>

            <div className="glass-card-static p-4 rounded-xl mb-6 text-left">
              <p className="text-sm text-gray-400 mb-2">Monthly EMI</p>
              <p className="text-2xl font-bold">₹{result.emi?.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500 mt-1">@ {result.creditScore.recommendation.estimatedInterestRate}% p.a. for {form.loan_tenure} months</p>
            </div>

            {result.creditScore.fraudFlags?.length > 0 && (
              <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-2 text-danger font-semibold mb-2">
                  <AlertTriangle className="w-4 h-4" /> Fraud Alerts
                </div>
                {result.creditScore.fraudFlags.map((f, i) => (
                  <p key={i} className="text-sm text-gray-400">• {f.message}</p>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/dashboard')} className="btn-neon">Go to Dashboard</button>
              <button onClick={() => navigate('/credit-score')} className="btn-outline">View Full Score</button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="particle-bg" />
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Apply for a Smart Loan</h1>
          <p className="text-gray-400 mb-8">Complete the form below — our AI will analyze your profile instantly.</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                step >= s.id ? 'bg-neon-green/10 text-neon-green' : 'text-gray-500'
              }`}>
                <s.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px flex-1 mx-2 ${step > s.id ? 'bg-neon-green/40' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                  <FormField label="Full Name" value={form.full_name} onChange={v => update('full_name', v)} error={errors.full_name} placeholder="Enter your full name" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Age" type="number" value={form.age} onChange={v => update('age', v)} error={errors.age} placeholder="25" />
                    <FormField label="Phone Number" value={form.phone} onChange={v => update('phone', v)} error={errors.phone} placeholder="+91 98765 43210" />
                  </div>
                  <FormField label="PAN Number" value={form.pan_number} onChange={v => update('pan_number', v.toUpperCase())} error={errors.pan_number} placeholder="ABCDE1234F" maxLength={10} />
                  <FormField label="Address" value={form.address} onChange={v => update('address', v)} placeholder="Full residential address" textarea />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h3 className="text-xl font-semibold mb-4">Income & Financial Details</h3>
                  <FormField label="Annual Income (₹)" type="number" value={form.annual_income} onChange={v => update('annual_income', v)} error={errors.annual_income} placeholder="800000" prefix="₹" />
                  <FormField label="Monthly Expenses (₹)" type="number" value={form.monthly_expenses} onChange={v => update('monthly_expenses', v)} error={errors.monthly_expenses} placeholder="35000" prefix="₹" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Existing Debts (₹)" type="number" value={form.existing_debts} onChange={v => update('existing_debts', v)} placeholder="0" prefix="₹" />
                    <FormField label="Total Savings (₹)" type="number" value={form.savings} onChange={v => update('savings', v)} placeholder="200000" prefix="₹" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="text-xl font-semibold mb-4">Employment Details</h3>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Employment Type</label>
                    <select value={form.employment_type} onChange={e => update('employment_type', e.target.value)} className="input-dark">
                      <option value="salaried">Salaried</option>
                      <option value="self-employed">Self-Employed</option>
                      <option value="business">Business Owner</option>
                      <option value="freelancer">Freelancer</option>
                    </select>
                  </div>
                  <FormField label="Company / Business Name" value={form.company_name} onChange={v => update('company_name', v)} error={errors.company_name} placeholder="e.g. Tata Consultancy Services" />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Designation" value={form.designation} onChange={v => update('designation', v)} error={errors.designation} placeholder="e.g. Software Engineer" />
                    <FormField label="Years Employed" type="number" value={form.years_employed} onChange={v => update('years_employed', v)} error={errors.years_employed} placeholder="5" />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <h3 className="text-xl font-semibold mb-4">Loan & Credit History</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Loan Amount (₹)" type="number" value={form.loan_amount} onChange={v => update('loan_amount', v)} error={errors.loan_amount} placeholder="500000" prefix="₹" />
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Tenure (Months)</label>
                      <select value={form.loan_tenure} onChange={e => update('loan_tenure', e.target.value)} className="input-dark">
                        {[12, 24, 36, 48, 60, 84, 120].map(t => (
                          <option key={t} value={t}>{t} months ({(t / 12).toFixed(1)} yrs)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Loan Purpose</label>
                    <select value={form.loan_purpose} onChange={e => update('loan_purpose', e.target.value)} className="input-dark">
                      {['Home Purchase', 'Home Renovation', 'Car Loan', 'Education Loan', 'Business Expansion', 'Wedding Expenses', 'Medical Emergency', 'Debt Consolidation', 'Travel', 'Personal Needs'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Existing Loans" type="number" value={form.existing_loans} onChange={v => update('existing_loans', v)} placeholder="0" />
                    <FormField label="Credit Cards" type="number" value={form.credit_cards} onChange={v => update('credit_cards', v)} placeholder="0" />
                    <FormField label="Missed Payments" type="number" value={form.missed_payments} onChange={v => update('missed_payments', v)} placeholder="0" />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            <button onClick={prevStep} disabled={step === 1} className="btn-outline flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            {step < 4 ? (
              <button onClick={nextStep} className="btn-neon flex items-center gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-neon flex items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {loading ? 'Processing...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, type = 'text', value, onChange, error, placeholder, prefix, textarea, maxLength }) {
  const El = textarea ? 'textarea' : 'input';
  return (
    <div>
      <label className="text-sm text-gray-400 mb-1.5 block">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>}
        <El
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={textarea ? 3 : undefined}
          className={`input-dark ${prefix ? 'pl-8' : ''} ${textarea ? 'resize-none' : ''} ${error ? 'border-danger/50' : ''}`}
        />
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
