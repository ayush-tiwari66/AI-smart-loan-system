-- SmartLoan Database Setup
-- Run this in Supabase Dashboard → SQL Editor

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

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (for service role - server side)
CREATE POLICY "Allow all for service role" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON loan_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON credit_scores FOR ALL USING (true) WITH CHECK (true);
