-- NYXA Database Schema
-- Target: PostgreSQL / Supabase
-- Last Updated: Phase 4 (Logic Hardening)

-- Enums
-- Task State Machine: strict ordered states. Only valid transitions are allowed.
-- Flow: OPEN → MATCHED → IN_PROGRESS → SUBMITTED → COMPLETED
-- Exit states: CANCELLED (buyer cancels), FAILED (agent fails to deliver)
CREATE TYPE task_status AS ENUM ('open', 'matched', 'in_progress', 'submitted', 'completed', 'cancelled', 'failed');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE escrow_status AS ENUM ('held', 'released', 'refunded');
CREATE TYPE agent_status AS ENUM ('active', 'inactive', 'banned');

-- USERS TABLE
-- Role flags allow multiple roles per user (e.g., a developer can also be a buyer).
-- Permissions enforced at the API layer:
--   is_buyer    → can post tasks
--   is_seller   → can complete tasks
--   is_developer → can register agents and APIs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    razorpay_customer_id TEXT,
    -- Role flags: a user can hold multiple roles simultaneously
    is_buyer      BOOLEAN DEFAULT false,
    is_seller     BOOLEAN DEFAULT false,
    is_developer  BOOLEAN DEFAULT false,
    score NUMERIC DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AGENTS TABLE
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    developer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    capabilities JSONB,
    instructions_permissions JSONB,
    execution_permissions JSONB,
    budget_controls JSONB,
    price_demand NUMERIC,
    wallet_balance NUMERIC DEFAULT 0.00,
    score NUMERIC DEFAULT 0.00,
    total_transactions INT DEFAULT 0,
    status agent_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- APIS TABLE
CREATE TABLE apis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    developer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    endpoint_url TEXT NOT NULL,
    price NUMERIC DEFAULT 0.00,
    documentation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TASKS TABLE
-- Tasks are posted by humans and assigned to agents
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    requirements JSONB,
    budget NUMERIC NOT NULL,
    -- Default state is 'open'. Transitions must follow the state machine defined above.
    status task_status DEFAULT 'open',
    assigned_to_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRANSACTIONS TABLE
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    api_id UUID REFERENCES apis(id) ON DELETE SET NULL,
    buyer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    commission NUMERIC DEFAULT 0.00,
    escrow_status escrow_status DEFAULT 'held',
    status transaction_status DEFAULT 'pending',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- REVIEWS TABLE
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    reviewer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) Placeholders
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE apis ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- TASK MATCHES TABLE
CREATE TABLE task_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    match_score NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE task_matches ENABLE ROW LEVEL SECURITY;

-- PERFORMANCE INDEXES
-- GIN index on agent capabilities for fast JSONB @> containment queries in the matching engine
CREATE INDEX idx_agents_capabilities ON agents USING GIN (capabilities);
-- Index on task status for fast filtering of open/active tasks
CREATE INDEX idx_tasks_status ON tasks (status);

-- Note: RLS policies to be defined when auth middleware is implemented.
