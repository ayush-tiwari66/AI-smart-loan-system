const express = require('express');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');
const { calculateCreditScore, calculateEMI } = require('../utils/creditEngine');

const router = express.Router();

// Submit loan application
router.post('/apply', auth, async (req, res) => {
  try {
    const {
      full_name, age, phone, address, pan_number,
      annual_income, monthly_expenses, existing_debts, savings,
      employment_type, company_name, designation, years_employed,
      existing_loans, credit_cards, missed_payments,
      loan_amount, loan_tenure, loan_purpose
    } = req.body;

    // Calculate credit score
    const creditResult = calculateCreditScore({
      annual_income, monthly_expenses, existing_debts, savings,
      employment_type, years_employed,
      existing_loans, credit_cards, missed_payments,
      loan_amount, age
    });

    // Calculate EMI
    const emi = calculateEMI(loan_amount, creditResult.recommendation.estimatedInterestRate, loan_tenure);

    // Insert application
    const { data: application, error } = await supabase
      .from('loan_applications')
      .insert([{
        user_id: req.user.id,
        full_name, age, phone, address, pan_number,
        annual_income, monthly_expenses, existing_debts, savings,
        employment_type, company_name, designation, years_employed,
        existing_loans: existing_loans || 0,
        credit_cards: credit_cards || 0,
        missed_payments: missed_payments || 0,
        loan_amount, loan_tenure, loan_purpose,
        credit_score: creditResult.score,
        risk_level: creditResult.riskLevel,
        approval_probability: creditResult.approvalProbability,
        fraud_flags: creditResult.fraudFlags,
        emi,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    // Save credit score record
    await supabase.from('credit_scores').insert([{
      user_id: req.user.id,
      score: creditResult.score,
      factors: creditResult.factors,
      risk_level: creditResult.riskLevel
    }]);

    res.status(201).json({
      application,
      creditScore: creditResult,
      emi
    });
  } catch (error) {
    console.error('Loan apply error:', error);
    res.status(500).json({ error: 'Failed to submit application.' });
  }
});

// Get user's loans
router.get('/my-loans', auth, async (req, res) => {
  try {
    const { data: loans, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ loans: loans || [] });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Failed to fetch loans.' });
  }
});

// Get single loan detail
router.get('/:id', auth, async (req, res) => {
  try {
    const { data: loan, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !loan) {
      return res.status(404).json({ error: 'Loan application not found.' });
    }

    res.json({ loan });
  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({ error: 'Failed to fetch loan.' });
  }
});

// EMI Calculator endpoint
router.post('/calculate-emi', auth, async (req, res) => {
  try {
    const { principal, rate, tenure } = req.body;
    const emi = calculateEMI(principal, rate, tenure);
    const totalPayment = emi * tenure;
    const totalInterest = totalPayment - principal;

    // Generate amortization schedule (first 12 months)
    const schedule = [];
    let balance = principal;
    const monthlyRate = rate / 12 / 100;

    for (let i = 1; i <= Math.min(tenure, 12); i++) {
      const interest = Math.round(balance * monthlyRate);
      const principalPart = emi - interest;
      balance = Math.max(0, balance - principalPart);
      schedule.push({
        month: i,
        emi,
        principal: principalPart,
        interest,
        balance: Math.round(balance)
      });
    }

    res.json({ emi, totalPayment, totalInterest, schedule });
  } catch (error) {
    res.status(500).json({ error: 'EMI calculation failed.' });
  }
});

module.exports = router;
