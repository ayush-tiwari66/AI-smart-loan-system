import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUpPkg from 'react-countup';
const CountUp = CountUpPkg.default ? CountUpPkg.default : CountUpPkg;
import { Zap, Shield, BarChart3, Clock, ChevronRight, Star, ArrowRight, Brain, Fingerprint, LineChart, IndianRupee } from 'lucide-react';
import GlowCard from '../components/ui/GlowCard';

const features = [
  { icon: Brain, title: 'AI Credit Scoring', desc: 'Advanced ML algorithms analyze 50+ parameters to generate accurate credit scores in seconds.', color: 'text-neon-green' },
  { icon: Zap, title: 'Instant Approval', desc: 'Get loan decisions in under 60 seconds with our automated risk assessment engine.', color: 'text-gold' },
  { icon: Shield, title: 'Fraud Detection', desc: 'Smart anomaly detection flags suspicious applications before they reach review.', color: 'text-blue-400' },
  { icon: LineChart, title: 'Risk Analysis', desc: 'Comprehensive risk profiling with detailed factor breakdowns and recommendations.', color: 'text-purple-400' },
  { icon: Fingerprint, title: 'Secure & Private', desc: 'Bank-grade encryption and data protection for all your financial information.', color: 'text-pink-400' },
  { icon: IndianRupee, title: 'Smart EMI Plans', desc: 'AI-optimized EMI structures tailored to your income and spending patterns.', color: 'text-emerald-400' },
];

const stats = [
  { value: 500, suffix: 'Cr+', label: 'Loans Disbursed (₹)', prefix: '₹' },
  { value: 10847, suffix: '+', label: 'Applications Processed' },
  { value: 98.5, suffix: '%', label: 'AI Accuracy Rate', decimals: 1 },
  { value: 52000, suffix: '+', label: 'Happy Customers' },
];

const steps = [
  { num: '01', title: 'Submit Application', desc: 'Fill your details in our smart multi-step form with real-time validation.' },
  { num: '02', title: 'AI Analysis', desc: 'Our engine analyzes your credit profile using 50+ financial parameters.' },
  { num: '03', title: 'Get Decision', desc: 'Receive instant approval with personalized loan terms and EMI plans.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <div className="particle-bg" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />

        {/* Animated background orbs */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-10 w-72 h-72 bg-neon-green/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-green/20 bg-neon-green/5 text-neon-green text-sm font-medium mb-8"
            >
              <Star className="w-4 h-4 fill-neon-green" />
              India's #1 AI-Powered Lending Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black leading-tight mb-6"
            >
              Get Instant{' '}
              <span className="text-gradient">Smart Loan</span>
              <br />
              Decisions
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Experience the future of lending. Our AI engine analyzes your financial profile in seconds to deliver instant, fair, and transparent loan decisions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/signup" className="btn-neon flex items-center gap-2 text-base">
                Apply Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/signup" className="btn-outline flex items-center gap-2">
                Check Eligibility <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>

          {/* Floating Credit Score Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-400 mb-2">AI Credit Score</p>
                  <div className="text-5xl font-black text-neon-green">
                    <CountUp end={782} duration={2.5} />
                  </div>
                  <p className="text-sm text-neon-green/70 mt-1">Excellent</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Approval Probability</p>
                  <div className="text-5xl font-black text-gold">
                    <CountUp end={94} duration={2} suffix="%" />
                  </div>
                  <p className="text-sm text-gold/70 mt-1">Very High</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-sm text-gray-400 mb-2">Max Eligible Amount</p>
                  <div className="text-5xl font-black text-white">
                    ₹<CountUp end={25} duration={2} suffix="L" />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">@ 8.5% p.a.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black text-gradient mb-2">
                  {stat.prefix || ''}<CountUp end={stat.value} duration={2.5} decimals={stat.decimals || 0} separator="," enableScrollSpy scrollSpyOnce />{stat.suffix}
                </div>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Powered by <span className="text-gradient">Intelligence</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with financial expertise to deliver the smartest lending decisions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <GlowCard key={feat.title} delay={i * 0.1} className="group">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${feat.color} group-hover:scale-110 transition-transform`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-green/[0.02] to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-gray-400 text-lg">Three simple steps to your smart loan decision</p>
          </motion.div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <GlowCard key={step.num} delay={i * 0.15}>
                <div className="flex items-start gap-6">
                  <div className="text-4xl font-black text-neon-green/20">{step.num}</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-400">{step.desc}</p>
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 via-transparent to-gold/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Your <span className="text-gradient">Smart Loan</span>?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join 52,000+ customers who trust SmartLoan for fast, fair, and intelligent lending decisions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="btn-neon flex items-center gap-2 text-base">
                  Start Your Application <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-neon-green" />
            <span className="font-bold">Smart<span className="text-neon-green">Loan</span></span>
          </div>
          <p className="text-sm text-gray-500">© 2024 SmartLoan. AI-Powered Fintech Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
