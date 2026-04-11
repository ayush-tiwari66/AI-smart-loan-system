/**
 * Database Setup & Seed Script
 * Creates tables in Supabase and seeds realistic loan data
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./config/supabase');
const { calculateCreditScore, calculateEMI } = require('./utils/creditEngine');

const INDIAN_NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Rohit Gupta', 'Ananya Singh', 'Vikram Mehta',
  'Sneha Reddy', 'Arjun Nair', 'Kavitha Iyer', 'Raj Malhotra', 'Deepika Joshi',
  'Amit Kumar', 'Pooja Verma', 'Sanjay Rao', 'Meera Chakraborty', 'Karan Kapoor',
  'Nisha Agarwal', 'Suresh Pillai', 'Ritu Bansal', 'Manish Tiwari', 'Swati Deshmukh',
  'Aditya Kulkarni', 'Shruti Saxena', 'Vivek Choudhury', 'Anjali Bhatt', 'Gaurav Pandey',
  'Neha Rastogi', 'Rajesh Mishra', 'Divya Menon', 'Ashish Srivastava', 'Pallavi Dutta'
];

const COMPANIES = [
  'Tata Consultancy Services', 'Infosys', 'Wipro', 'HCL Technologies', 'Tech Mahindra',
  'Reliance Industries', 'HDFC Bank', 'ICICI Bank', 'Bajaj Finance', 'Mahindra & Mahindra',
  'Larsen & Toubro', 'Asian Paints', 'Bharti Airtel', 'ITC Limited', 'Flipkart',
  'Zomato', 'Paytm', 'PhonePe', 'Google India', 'Microsoft India'
];

const DESIGNATIONS = [
  'Software Engineer', 'Senior Developer', 'Product Manager', 'Business Analyst',
  'Data Scientist', 'Marketing Manager', 'Financial Analyst', 'HR Manager',
  'Operations Lead', 'Sales Executive', 'Team Lead', 'VP Engineering',
  'Consultant', 'Architect', 'Director'
];

const LOAN_PURPOSES = [
  'Home Purchase', 'Home Renovation', 'Car Loan', 'Education Loan',
  'Business Expansion', 'Wedding Expenses', 'Medical Emergency',
  'Debt Consolidation', 'Travel', 'Personal Needs'
];

const ADDRESSES = [
  '42, MG Road, Bengaluru, Karnataka 560001',
  '15, Park Street, Kolkata, West Bengal 700016',
  '78, Connaught Place, New Delhi 110001',
  '23, Marine Drive, Mumbai, Maharashtra 400002',
  '56, Anna Salai, Chennai, Tamil Nadu 600002',
  '91, Banjara Hills, Hyderabad, Telangana 500034',
  '34, Civil Lines, Jaipur, Rajasthan 302006',
  '67, Sector 17, Chandigarh 160017',
  '12, Koregaon Park, Pune, Maharashtra 411001',
  '45, Hazratganj, Lucknow, Uttar Pradesh 226001'
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePAN() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array(5).fill(0).map(() => letters[Math.floor(Math.random() * 26)]).join('')
    + String(randomBetween(1000, 9999))
    + letters[Math.floor(Math.random() * 26)];
}

function generatePhone() {
  return `+91 ${randomBetween(70000, 99999)}${randomBetween(10000, 99999)}`;
}

async function setupDatabase() {
  console.log('🔧 Setting up database tables...\n');

  // Create tables using Supabase SQL (via RPC or direct)
  // We'll use the REST API to create data - tables should be created via Supabase Dashboard SQL editor
  // Let's first try to create via the admin API

  const createTableSQL = `
    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create loan_applications table
    CREATE TABLE IF NOT EXISTS loan_applications (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      full_name VARCHAR(255),
      age INTEGER,
      phone VARCHAR(20),
      address TEXT,
      pan_number VARCHAR(10),
      annual_income NUMERIC(12,2),
      monthly_expenses NUMERIC(12,2),
      existing_debts NUMERIC(12,2),
      savings NUMERIC(12,2),
      employment_type VARCHAR(50),
      company_name VARCHAR(255),
      designation VARCHAR(255),
      years_employed INTEGER,
      existing_loans INTEGER DEFAULT 0,
      credit_cards INTEGER DEFAULT 0,
      missed_payments INTEGER DEFAULT 0,
      loan_amount NUMERIC(12,2),
      loan_tenure INTEGER,
      loan_purpose VARCHAR(100),
      credit_score INTEGER,
      risk_level VARCHAR(20),
      approval_probability NUMERIC(5,2),
      fraud_flags JSONB DEFAULT '[]',
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      admin_notes TEXT,
      emi NUMERIC(12,2),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create credit_scores table
    CREATE TABLE IF NOT EXISTS credit_scores (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      score INTEGER CHECK (score >= 300 AND score <= 900),
      factors JSONB,
      risk_level VARCHAR(20),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Disable RLS for all tables (for development)
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;

    -- Create policies for service role access
    DO $$ BEGIN
      -- Users policies
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'service_role_all_users') THEN
        CREATE POLICY service_role_all_users ON users FOR ALL USING (true) WITH CHECK (true);
      END IF;
      -- Loan applications policies
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loan_applications' AND policyname = 'service_role_all_loans') THEN
        CREATE POLICY service_role_all_loans ON loan_applications FOR ALL USING (true) WITH CHECK (true);
      END IF;
      -- Credit scores policies
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'credit_scores' AND policyname = 'service_role_all_scores') THEN
        CREATE POLICY service_role_all_scores ON credit_scores FOR ALL USING (true) WITH CHECK (true);
      END IF;
    END $$;
  `;

  console.log('📋 SQL to run in Supabase Dashboard SQL Editor:');
  console.log('================================================');
  console.log(createTableSQL);
  console.log('================================================\n');
  console.log('👆 Copy the SQL above and run it in your Supabase Dashboard → SQL Editor\n');
  console.log('After running the SQL, press Enter to continue with seeding data...\n');

  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  await seedData();
}

async function seedData() {
  console.log('🌱 Seeding database with realistic data...\n');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const { data: adminUser, error: adminError } = await supabase
    .from('users')
    .upsert([{
      name: 'Admin User',
      email: 'admin@smartloan.com',
      password: adminPassword,
      role: 'admin'
    }], { onConflict: 'email' })
    .select()
    .single();

  if (adminError) {
    console.error('Failed to create admin:', adminError.message);
  } else {
    console.log('✅ Admin created: admin@smartloan.com / admin123');
  }

  // Create sample user
  const userPassword = await bcrypt.hash('user123', 12);
  const { data: sampleUser, error: userError } = await supabase
    .from('users')
    .upsert([{
      name: 'Rahul Verma',
      email: 'rahul@email.com',
      password: userPassword,
      role: 'user'
    }], { onConflict: 'email' })
    .select()
    .single();

  if (userError) {
    console.error('Failed to create sample user:', userError.message);
  } else {
    console.log('✅ Sample user created: rahul@email.com / user123');
  }

  // Create multiple users
  const userIds = [sampleUser?.id].filter(Boolean);
  const additionalUsers = [];

  for (let i = 0; i < 8; i++) {
    const name = INDIAN_NAMES[i + 2];
    const email = name.toLowerCase().replace(/\s/g, '.') + '@email.com';
    additionalUsers.push({
      name,
      email,
      password: userPassword,
      role: 'user'
    });
  }

  const { data: createdUsers, error: usersError } = await supabase
    .from('users')
    .upsert(additionalUsers, { onConflict: 'email' })
    .select('id');

  if (createdUsers) {
    userIds.push(...createdUsers.map(u => u.id));
  }

  console.log(`✅ Created ${userIds.length} users total\n`);

  // Generate 50 realistic loan applications
  console.log('📊 Generating loan applications...');
  const applications = [];
  const statuses = ['pending', 'approved', 'approved', 'approved', 'rejected', 'pending'];

  for (let i = 0; i < 50; i++) {
    const userId = userIds[i % userIds.length];
    const name = INDIAN_NAMES[i % INDIAN_NAMES.length];
    const age = randomBetween(23, 58);
    const annualIncome = randomBetween(3, 50) * 100000;
    const monthlyExpenses = Math.round(annualIncome / 12 * (randomBetween(30, 70) / 100));
    const existingDebts = randomBetween(0, 10) * 50000;
    const savings = Math.round(annualIncome * (randomBetween(10, 80) / 100));
    const yearsEmployed = randomBetween(0, 25);
    const existingLoans = randomBetween(0, 4);
    const creditCards = randomBetween(0, 5);
    const missedPayments = randomBetween(0, 5);
    const loanAmount = randomBetween(1, 50) * 100000;
    const loanTenure = [12, 24, 36, 48, 60, 84, 120][randomBetween(0, 6)];
    const employmentType = ['salaried', 'self-employed', 'business', 'freelancer'][randomBetween(0, 3)];

    const creditResult = calculateCreditScore({
      annual_income: annualIncome,
      monthly_expenses: monthlyExpenses,
      existing_debts: existingDebts,
      savings,
      employment_type: employmentType,
      years_employed: yearsEmployed,
      existing_loans: existingLoans,
      credit_cards: creditCards,
      missed_payments: missedPayments,
      loan_amount: loanAmount,
      age
    });

    const emi = calculateEMI(loanAmount, creditResult.recommendation.estimatedInterestRate, loanTenure);
    const status = randomFrom(statuses);

    // Randomize dates over last 6 months
    const daysAgo = randomBetween(0, 180);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    applications.push({
      user_id: userId,
      full_name: name,
      age,
      phone: generatePhone(),
      address: randomFrom(ADDRESSES),
      pan_number: generatePAN(),
      annual_income: annualIncome,
      monthly_expenses: monthlyExpenses,
      existing_debts: existingDebts,
      savings,
      employment_type: employmentType,
      company_name: randomFrom(COMPANIES),
      designation: randomFrom(DESIGNATIONS),
      years_employed: yearsEmployed,
      existing_loans: existingLoans,
      credit_cards: creditCards,
      missed_payments: missedPayments,
      loan_amount: loanAmount,
      loan_tenure: loanTenure,
      loan_purpose: randomFrom(LOAN_PURPOSES),
      credit_score: creditResult.score,
      risk_level: creditResult.riskLevel,
      approval_probability: creditResult.approvalProbability,
      fraud_flags: creditResult.fraudFlags,
      emi,
      status,
      admin_notes: status === 'approved' ? 'Application verified and approved.' : status === 'rejected' ? 'Risk assessment too high.' : null,
      created_at: createdAt
    });
  }

  // Insert in batches
  for (let i = 0; i < applications.length; i += 10) {
    const batch = applications.slice(i, i + 10);
    const { error } = await supabase.from('loan_applications').insert(batch);
    if (error) {
      console.error(`Batch ${i / 10 + 1} error:`, error.message);
    } else {
      console.log(`  ✅ Batch ${i / 10 + 1}: ${batch.length} applications inserted`);
    }
  }

  // Generate credit scores for users
  console.log('\n📈 Generating credit score history...');
  const creditScores = [];

  for (const userId of userIds) {
    for (let j = 0; j < 5; j++) {
      const daysAgo = j * 30;
      const score = randomBetween(450, 850);
      creditScores.push({
        user_id: userId,
        score,
        factors: [
          { name: 'Payment History', score: randomBetween(50, 100), weight: '35%' },
          { name: 'Credit Utilization', score: randomBetween(40, 100), weight: '30%' },
          { name: 'Employment Stability', score: randomBetween(30, 100), weight: '15%' },
          { name: 'Credit Mix', score: randomBetween(40, 100), weight: '10%' },
          { name: 'Income & Savings', score: randomBetween(35, 100), weight: '10%' }
        ],
        risk_level: score >= 750 ? 'Low' : score >= 650 ? 'Medium' : 'High',
        created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  const { error: scoreError } = await supabase.from('credit_scores').insert(creditScores);
  if (scoreError) {
    console.error('Credit scores error:', scoreError.message);
  } else {
    console.log(`  ✅ ${creditScores.length} credit score records inserted`);
  }

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📌 Login credentials:');
  console.log('  Admin: admin@smartloan.com / admin123');
  console.log('  User:  rahul@email.com / user123\n');

  process.exit(0);
}

setupDatabase().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
