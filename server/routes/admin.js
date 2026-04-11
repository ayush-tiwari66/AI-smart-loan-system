const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Get all applications (admin)
router.get('/applications', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('loan_applications')
      .select('*, users!inner(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,pan_number.ilike.%${search}%`);
    }

    const { data: applications, error, count } = await query;

    if (error) throw error;

    res.json({
      applications: applications || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Admin get apps error:', error);
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

// Approve or reject application (admin)
router.patch('/applications/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { status, admin_notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected.' });
    }

    const { data: application, error } = await supabase
      .from('loan_applications')
      .update({ status, admin_notes })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ application });
  } catch (error) {
    console.error('Admin update error:', error);
    res.status(500).json({ error: 'Failed to update application.' });
  }
});

// Analytics (admin)
router.get('/analytics', auth, roleCheck('admin'), async (req, res) => {
  try {
    // Get all applications
    const { data: allApps, error } = await supabase
      .from('loan_applications')
      .select('status, credit_score, loan_amount, risk_level, created_at, emi');

    if (error) throw error;

    const apps = allApps || [];
    const total = apps.length;
    const approved = apps.filter(a => a.status === 'approved').length;
    const rejected = apps.filter(a => a.status === 'rejected').length;
    const pending = apps.filter(a => a.status === 'pending').length;

    const avgCreditScore = total > 0
      ? Math.round(apps.reduce((sum, a) => sum + (a.credit_score || 0), 0) / total)
      : 0;

    const totalDisbursed = apps
      .filter(a => a.status === 'approved')
      .reduce((sum, a) => sum + (a.loan_amount || 0), 0);

    const totalEMICollection = apps
      .filter(a => a.status === 'approved')
      .reduce((sum, a) => sum + (a.emi || 0), 0);

    // Risk distribution
    const riskDist = {
      Low: apps.filter(a => a.risk_level === 'Low').length,
      Medium: apps.filter(a => a.risk_level === 'Medium').length,
      High: apps.filter(a => a.risk_level === 'High').length,
      'Very High': apps.filter(a => a.risk_level === 'Very High').length
    };

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthApps = apps.filter(a => {
        const d = new Date(a.created_at);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      });
      monthlyTrends.push({
        month: `${month} ${year}`,
        total: monthApps.length,
        approved: monthApps.filter(a => a.status === 'approved').length,
        rejected: monthApps.filter(a => a.status === 'rejected').length
      });
    }

    // Score distribution
    const scoreDist = {
      '300-500': apps.filter(a => a.credit_score >= 300 && a.credit_score < 500).length,
      '500-650': apps.filter(a => a.credit_score >= 500 && a.credit_score < 650).length,
      '650-750': apps.filter(a => a.credit_score >= 650 && a.credit_score < 750).length,
      '750-900': apps.filter(a => a.credit_score >= 750 && a.credit_score <= 900).length
    };

    res.json({
      kpis: {
        totalApplications: total,
        approved,
        rejected,
        pending,
        approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
        avgCreditScore,
        totalDisbursed,
        totalEMICollection
      },
      riskDistribution: riskDist,
      monthlyTrends,
      scoreDistribution: scoreDist
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

module.exports = router;
