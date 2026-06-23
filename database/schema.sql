-- Nyxa Supabase Schema Definition
-- Last Updated: Architecture Audit Migration

-- Enums
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('open', 'matched', 'in_progress', 'submitted', 'completed', 'cancelled', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE escrow_status AS ENUM ('held', 'released', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE agent_status AS ENUM ('active', 'inactive', 'banned');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  roles TEXT[] DEFAULT '{buyer}'::TEXT[],
  score NUMERIC DEFAULT 0.00,
  razorpay_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Agents Table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  capabilities JSONB DEFAULT '[]'::JSONB NOT NULL,
  price_demand NUMERIC NOT NULL,
  status agent_status DEFAULT 'active',
  score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. APIs Table
CREATE TABLE IF NOT EXISTS apis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  price NUMERIC NOT NULL,
  documentation TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tasks Table (Predefined Services Catalog)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Orders/Transactions Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  api_id UUID REFERENCES apis(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  payer_id UUID REFERENCES profiles(id) NOT NULL,
  payee_id UUID REFERENCES profiles(id),
  razorpay_order_id TEXT,
  amount NUMERIC NOT NULL,
  status transaction_status DEFAULT 'pending',
  escrow_status escrow_status DEFAULT 'held',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT check_order_type CHECK (
    (task_id IS NOT NULL)::integer + 
    (api_id IS NOT NULL)::integer + 
    (agent_id IS NOT NULL)::integer = 1
  )
);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE apis ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read all profiles. Only the user can update their own.
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Agents: Public can read active agents. Only provider can insert/update.
CREATE POLICY "Public agents are viewable by everyone." ON agents FOR SELECT USING (status = 'active' OR auth.uid() = provider_id);
CREATE POLICY "Users can create their own agents." ON agents FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Users can update their own agents." ON agents FOR UPDATE USING (auth.uid() = provider_id);

-- APIs: Public can read active APIs. Only provider can insert/update.
CREATE POLICY "Public APIs are viewable by everyone." ON apis FOR SELECT USING (status = 'active' OR auth.uid() = provider_id);
CREATE POLICY "Users can create their own APIs." ON apis FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Users can update their own APIs." ON apis FOR UPDATE USING (auth.uid() = provider_id);

-- Tasks: Public can read active tasks. Only provider can insert/update.
CREATE POLICY "Public tasks are viewable by everyone." ON tasks FOR SELECT USING (status = 'active' OR auth.uid() = provider_id);
CREATE POLICY "Users can create their own tasks." ON tasks FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Users can update their own tasks." ON tasks FOR UPDATE USING (auth.uid() = provider_id);

-- Orders: Only payer and payee can view their orders.
CREATE POLICY "Users can view own orders." ON orders FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = payee_id);
CREATE POLICY "Users can create orders as payer." ON orders FOR INSERT WITH CHECK (auth.uid() = payer_id);
