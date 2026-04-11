/**
 * SmartLoan Credit Scoring Engine
 * Simulates a CIBIL-like credit scoring system (300-900 range)
 * Uses weighted formula based on financial parameters
 */

function calculateCreditScore(data) {
  const {
    annual_income = 0,
    monthly_expenses = 0,
    existing_debts = 0,
    savings = 0,
    employment_type = 'salaried',
    years_employed = 0,
    existing_loans = 0,
    credit_cards = 0,
    missed_payments = 0,
    loan_amount = 0,
    age = 25
  } = data;

  const factors = [];
  let totalScore = 0;

  // 1. Payment History (35% weight) - Max 315 points
  const paymentHistoryMax = 315;
  let paymentScore = paymentHistoryMax;
  if (missed_payments > 0) {
    paymentScore -= missed_payments * 45;
  }
  if (missed_payments === 0 && years_employed > 3) {
    paymentScore = paymentHistoryMax; // Perfect history bonus
  }
  paymentScore = Math.max(0, Math.min(paymentHistoryMax, paymentScore));
  totalScore += paymentScore;
  factors.push({
    name: 'Payment History',
    weight: '35%',
    score: Math.round((paymentScore / paymentHistoryMax) * 100),
    maxScore: 100,
    impact: missed_payments === 0 ? 'positive' : missed_payments <= 2 ? 'neutral' : 'negative',
    description: missed_payments === 0
      ? 'Excellent payment track record with no missed payments'
      : `${missed_payments} missed payment(s) detected, affecting your score negatively`
  });

  // 2. Credit Utilization (30% weight) - Max 270 points
  const creditUtilMax = 270;
  const monthlyIncome = annual_income / 12;
  const debtToIncome = monthlyIncome > 0 ? (monthly_expenses + (existing_debts / 12)) / monthlyIncome : 1;
  let creditUtilScore;
  if (debtToIncome <= 0.3) {
    creditUtilScore = creditUtilMax;
  } else if (debtToIncome <= 0.5) {
    creditUtilScore = creditUtilMax * 0.75;
  } else if (debtToIncome <= 0.7) {
    creditUtilScore = creditUtilMax * 0.5;
  } else {
    creditUtilScore = creditUtilMax * 0.25;
  }
  totalScore += creditUtilScore;
  factors.push({
    name: 'Credit Utilization',
    weight: '30%',
    score: Math.round((creditUtilScore / creditUtilMax) * 100),
    maxScore: 100,
    impact: debtToIncome <= 0.3 ? 'positive' : debtToIncome <= 0.5 ? 'neutral' : 'negative',
    description: `Debt-to-income ratio is ${(debtToIncome * 100).toFixed(1)}%. ${debtToIncome <= 0.3 ? 'Well within healthy limits' : debtToIncome <= 0.5 ? 'Moderate utilization' : 'High utilization - consider reducing debts'}`
  });

  // 3. Credit Age / Employment Stability (15% weight) - Max 135 points
  const creditAgeMax = 135;
  let creditAgeScore;
  if (years_employed >= 10) {
    creditAgeScore = creditAgeMax;
  } else if (years_employed >= 5) {
    creditAgeScore = creditAgeMax * 0.8;
  } else if (years_employed >= 2) {
    creditAgeScore = creditAgeMax * 0.6;
  } else {
    creditAgeScore = creditAgeMax * 0.35;
  }
  totalScore += creditAgeScore;
  factors.push({
    name: 'Employment Stability',
    weight: '15%',
    score: Math.round((creditAgeScore / creditAgeMax) * 100),
    maxScore: 100,
    impact: years_employed >= 5 ? 'positive' : years_employed >= 2 ? 'neutral' : 'negative',
    description: `${years_employed} year(s) of employment. ${years_employed >= 5 ? 'Strong employment stability' : years_employed >= 2 ? 'Building employment history' : 'Limited employment history'}`
  });

  // 4. Credit Mix (10% weight) - Max 90 points
  const creditMixMax = 90;
  let creditMixScore = creditMixMax * 0.5; // Base
  if (existing_loans > 0 && existing_loans <= 3) creditMixScore += 20;
  if (credit_cards > 0 && credit_cards <= 3) creditMixScore += 20;
  if (savings > annual_income * 0.2) creditMixScore += 15;
  creditMixScore = Math.min(creditMixMax, creditMixScore);
  totalScore += creditMixScore;
  factors.push({
    name: 'Credit Mix',
    weight: '10%',
    score: Math.round((creditMixScore / creditMixMax) * 100),
    maxScore: 100,
    impact: creditMixScore >= creditMixMax * 0.7 ? 'positive' : 'neutral',
    description: `${existing_loans} active loan(s), ${credit_cards} credit card(s). ${creditMixScore >= creditMixMax * 0.7 ? 'Good diversity of credit' : 'Consider diversifying credit types'}`
  });

  // 5. Income & Savings Strength (10% weight) - Max 90 points
  const incomeMax = 90;
  let incomeScore;
  if (annual_income >= 1500000) {
    incomeScore = incomeMax;
  } else if (annual_income >= 800000) {
    incomeScore = incomeMax * 0.8;
  } else if (annual_income >= 400000) {
    incomeScore = incomeMax * 0.6;
  } else {
    incomeScore = incomeMax * 0.35;
  }
  // Savings bonus
  if (savings >= annual_income * 0.5) incomeScore = Math.min(incomeMax, incomeScore + 10);
  totalScore += incomeScore;
  factors.push({
    name: 'Income & Savings',
    weight: '10%',
    score: Math.round((incomeScore / incomeMax) * 100),
    maxScore: 100,
    impact: annual_income >= 800000 ? 'positive' : annual_income >= 400000 ? 'neutral' : 'negative',
    description: `Annual income: ₹${(annual_income / 100000).toFixed(1)}L. ${annual_income >= 800000 ? 'Strong income level' : 'Income could be stronger for better rates'}`
  });

  // Normalize to 300-900 range
  const rawScore = totalScore; // Max possible: 315 + 270 + 135 + 90 + 90 = 900
  const finalScore = Math.max(300, Math.min(900, Math.round(rawScore + 300 * (rawScore / 900))));
  const normalizedScore = Math.max(300, Math.min(900, Math.round(300 + (finalScore / 900) * 600)));

  // Determine risk level
  let riskLevel, approvalProbability;
  if (normalizedScore >= 750) {
    riskLevel = 'Low';
    approvalProbability = Math.min(98, 85 + (normalizedScore - 750) * 0.1);
  } else if (normalizedScore >= 650) {
    riskLevel = 'Medium';
    approvalProbability = 55 + (normalizedScore - 650) * 0.3;
  } else if (normalizedScore >= 500) {
    riskLevel = 'High';
    approvalProbability = 20 + (normalizedScore - 500) * 0.23;
  } else {
    riskLevel = 'Very High';
    approvalProbability = Math.max(5, normalizedScore / 25);
  }

  // Fraud detection flags
  const fraudFlags = [];
  if (loan_amount > annual_income * 5) {
    fraudFlags.push({ type: 'HIGH_LOAN_TO_INCOME', message: 'Loan amount exceeds 5x annual income', severity: 'high' });
  }
  if (annual_income > 5000000 && years_employed < 2) {
    fraudFlags.push({ type: 'INCOME_EXPERIENCE_MISMATCH', message: 'High income with very low experience', severity: 'medium' });
  }
  if (existing_loans > 5) {
    fraudFlags.push({ type: 'MULTIPLE_LOANS', message: 'Unusually high number of existing loans', severity: 'medium' });
  }
  if (age < 21 && annual_income > 2000000) {
    fraudFlags.push({ type: 'AGE_INCOME_MISMATCH', message: 'Very young applicant with high income', severity: 'low' });
  }

  // Loan recommendation
  const recommendedAmount = Math.min(loan_amount, annual_income * 3);
  const recommendedTenure = recommendedAmount > 1000000 ? 60 : recommendedAmount > 500000 ? 36 : 24;

  return {
    score: normalizedScore,
    riskLevel,
    approvalProbability: Math.round(approvalProbability * 10) / 10,
    factors,
    fraudFlags,
    recommendation: {
      maxLoanAmount: recommendedAmount,
      suggestedTenure: recommendedTenure,
      estimatedInterestRate: riskLevel === 'Low' ? 8.5 : riskLevel === 'Medium' ? 12 : 16.5,
      message: normalizedScore >= 750
        ? 'Excellent profile! You qualify for premium loan rates.'
        : normalizedScore >= 650
        ? 'Good profile. Standard loan terms available.'
        : 'Consider improving your credit score for better rates.'
    }
  };
}

function calculateEMI(principal, annualRate, tenureMonths) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / tenureMonths;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}

module.exports = { calculateCreditScore, calculateEMI };
