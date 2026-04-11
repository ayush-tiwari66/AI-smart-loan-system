/**
 * Quick Seed Script - No user input needed
 * Tables already created via Supabase SQL Editor
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./config/supabase');
const { calculateCreditScore, calculateEMI } = require('./utils/creditEngine');

const NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Rohit Gupta', 'Ananya Singh', 'Vikram Mehta',
  'Sneha Reddy', 'Arjun Nair', 'Kavitha Iyer', 'Raj Malhotra', 'Deepika Joshi',
  'Amit Kumar', 'Pooja Verma', 'Sanjay Rao', 'Meera Chakraborty', 'Karan Kapoor',
  'Nisha Agarwal', 'Suresh Pillai', 'Ritu Bansal', 'Manish Tiwari', 'Swati Deshmukh',
  'Aditya Kulkarni', 'Shruti Saxena', 'Vivek Choudhury', 'Anjali Bhatt', 'Gaurav Pandey',
  'Neha Rastogi', 'Rajesh Mishra', 'Divya Menon', 'Ashish Srivastava', 'Pallavi Dutta'
];

const COMPANIES = [
  'TCS', 'Infosys', 'Wipro', 'HCL Technologies', 'Tech Mahindra',
  'Reliance Industries', 'HDFC Bank', 'ICICI Bank', 'Bajaj Finance', 'L&T',
  'Asian Paints', 'Bharti Airtel', 'ITC Limited', 'Flipkart', 'Zomato',
  'Paytm', 'Google India', 'Microsoft India', 'Amazon India', 'PhonePe'
];

const DESIGNATIONS = [
  'Software Engineer', 'Senior Developer', 'Product Manager', 'Business Analyst',
  'Data Scientist', 'Marketing Manager', 'Financial Analyst', 'HR Manager',
  'Operations Lead', 'Sales Executive', 'Team Lead', 'Consultant', 'Architect',
  'Director', 'VP Engineering'
];

const PURPOSES = [
  'Home Purchase', 'Home Renovation', 'Car Loan', 'Education Loan',
  'Business Expansion', 'Wedding Expenses', 'Medical Emergency',
  'Debt Consolidation', 'Travel', 'Personal Needs'
];

const ADDRESSES = [
  '42 MG Road, Bengaluru, Karnataka 560001',
  '15 Park Street, Kolkata, West Bengal 700016',
  '78 Connaught Place, New Delhi 110001',
  '23 Marine Drive, Mumbai, Maharashtra 400002',
  '56 Anna Salai, Chennai, Tamil Nadu 600002',
  '91 Banjara Hills, Hyderabad, Telangana 500034',
  '34 Civil Lines, Jaipur, Rajasthan 302006',
  '67 Sector 17, Chandigarh 160017',
  '12 Koregaon Park, Pune, Maharashtra 411001',
  '45 Hazratganj, Lucknow, UP 226001'
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rng(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function genPAN() {
  const l = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array(5).fill(0).map(() => l[Math.floor(Math.random() * 26)]).join('') + rng(1000, 9999) + l[Math.floor(Math.random() * 26)];
}

async function seed() {
  console.log('🌱 Seeding SmartLoan database...\n');

  const adminPw = await bcrypt.hash('admin123', 12);
  const userPw = await bcrypt.hash('user123', 12);

  // Create admin
  const { data: admin, error: ae } = await supabase
    .from('users')
    .upsert([{ name: 'Admin User', email: 'admin@smartloan.com', password: adminPw, role: 'admin' }], { onConflict: 'email' })
    .select().single();
  console.log('✅ Admin:', ae ? 'Error: ' + ae.message : 'OK');

  // Create sample user
  const { data: sampleUser, error: ue } = await supabase
    .from('users')
    .upsert([{ name: 'Rahul Verma', email: 'rahul@email.com', password: userPw, role: 'user' }], { onConflict: 'email' })
    .select().single();
  console.log('✅ Sample user:', ue ? 'Error: ' + ue.message : 'OK');

  // Create more users
  const moreUsers = [];
  for (let i = 0; i < 8; i++) {
    const name = NAMES[i + 2];
    const email = name.toLowerCase().replace(/\s/g, '.') + '@email.com';
    moreUsers.push({ name, email, password: userPw, role: 'user' });
  }
  const { data: created } = await supabase
    .from('users')
    .upsert(moreUsers, { onConflict: 'email' })
    .select('id');

  const userIds = [sampleUser?.id, ...(created || []).map(u => u.id)].filter(Boolean);
  console.log('✅ Total users:', userIds.length);

  // Generate 50 loan applications
  console.log('\n📊 Generating loan applications...');
  const statuses = ['pending', 'approved', 'approved', 'approved', 'rejected', 'pending'];
  const applications = [];

  for (let i = 0; i < 50; i++) {
    const userId = userIds[i % userIds.length];
    const age = rng(23, 58);
    const annualIncome = rng(3, 50) * 100000;
    const monthlyExpenses = Math.round(annualIncome / 12 * (rng(30, 70) / 100));
    const existingDebts = rng(0, 10) * 50000;
    const savings = Math.round(annualIncome * (rng(10, 80) / 100));
    const yearsEmployed = rng(0, 25);
    const existingLoans = rng(0, 4);
    const creditCards = rng(0, 5);
    const missedPayments = rng(0, 5);
    const loanAmount = rng(1, 50) * 100000;
    const loanTenure = [12, 24, 36, 48, 60, 84, 120][rng(0, 6)];
    const employmentType = ['salaried', 'self-employed', 'business', 'freelancer'][rng(0, 3)];

    const cr = calculateCreditScore({
      annual_income: annualIncome, monthly_expenses: monthlyExpenses,
      existing_debts: existingDebts, savings, employment_type: employmentType,
      years_employed: yearsEmployed, existing_loans: existingLoans,
      credit_cards: creditCards, missed_payments: missedPayments,
      loan_amount: loanAmount, age
    });

    const emi = calculateEMI(loanAmount, cr.recommendation.estimatedInterestRate, loanTenure);
    const status = rand(statuses);
    const daysAgo = rng(0, 180);

    applications.push({
      user_id: userId,
      full_name: NAMES[i % NAMES.length],
      age, phone: '+91 ' + rng(70000, 99999) + rng(10000, 99999),
      address: rand(ADDRESSES), pan_number: genPAN(),
      annual_income: annualIncome, monthly_expenses: monthlyExpenses,
      existing_debts: existingDebts, savings,
      employment_type: employmentType, company_name: rand(COMPANIES),
      designation: rand(DESIGNATIONS), years_employed: yearsEmployed,
      existing_loans: existingLoans, credit_cards: creditCards,
      missed_payments: missedPayments, loan_amount: loanAmount,
      loan_tenure: loanTenure, loan_purpose: rand(PURPOSES),
      credit_score: cr.score, risk_level: cr.riskLevel,
      approval_probability: cr.approvalProbability,
      fraud_flags: cr.fraudFlags, emi, status,
      admin_notes: status === 'approved' ? 'Verified and approved.' : status === 'rejected' ? 'Risk too high.' : null,
      created_at: new Date(Date.now() - daysAgo * 86400000).toISOString()
    });
  }

  // Insert in batches
  for (let i = 0; i < applications.length; i += 10) {
    const batch = applications.slice(i, i + 10);
    const { error } = await supabase.from('loan_applications').insert(batch);
    console.log('  Batch', (i / 10 + 1) + ':', error ? 'ERR: ' + error.message : '✅ OK');
  }

  // Credit scores
  console.log('\n📈 Generating credit scores...');
  const scores = [];
  for (const uid of userIds) {
    for (let j = 0; j < 5; j++) {
      const score = rng(450, 850);
      scores.push({
        user_id: uid, score,
        factors: [
          { name: 'Payment History', score: rng(50, 100), weight: '35%' },
          { name: 'Credit Utilization', score: rng(40, 100), weight: '30%' },
          { name: 'Employment Stability', score: rng(30, 100), weight: '15%' },
          { name: 'Credit Mix', score: rng(40, 100), weight: '10%' },
          { name: 'Income & Savings', score: rng(35, 100), weight: '10%' }
        ],
        risk_level: score >= 750 ? 'Low' : score >= 650 ? 'Medium' : 'High',
        created_at: new Date(Date.now() - j * 30 * 86400000).toISOString()
      });
    }
  }
  const { error: se } = await supabase.from('credit_scores').insert(scores);
  console.log('  Scores:', se ? 'ERR: ' + se.message : '✅ OK (' + scores.length + ' records)');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📌 Login credentials:');
  console.log('   Admin: admin@smartloan.com / admin123');
  console.log('   User:  rahul@email.com / user123\n');
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
