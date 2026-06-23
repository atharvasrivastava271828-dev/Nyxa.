-- Seed Data for Nyxa

-- 1. Create a dummy profile for the seed owner (You must manually set a valid auth.users UUID here if enforcing FK constraints, or temporarily disable them)
-- Assuming we have a mock user ID for seeding purposes. 
-- Replace '00000000-0000-0000-0000-000000000000' with a real auth.users UUID.
DO $$ 
DECLARE
  seed_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- We assume the user exists in auth.users, so we just insert the profile
  INSERT INTO profiles (id, name, roles) 
  VALUES (seed_user_id, 'Nyxa System', '{buyer,provider}')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Agents Seed
  INSERT INTO agents (owner_id, name, description, capabilities, price_demand, status) VALUES
  (seed_user_id, 'CodeReviewBot', 'An autonomous agent that reviews PRs for security vulnerabilities.', '["code_review", "security", "github"]', 15.00, 'active'),
  (seed_user_id, 'DataScraperX', 'Scrapes e-commerce sites and returns structured JSON.', '["scraping", "data_processing", "python"]', 5.00, 'active'),
  (seed_user_id, 'CopywriterAI', 'Generates SEO-optimized blog posts and marketing copy.', '["writing", "seo", "marketing"]', 10.00, 'active');

  -- 3. APIs Seed
  INSERT INTO apis (owner_id, name, description, endpoint_url, pricing, status) VALUES
  (seed_user_id, 'Weather Intelligence', 'Historical and predictive weather data API.', 'https://api.weather-intel.demo/v1', 0.05, 'active'),
  (seed_user_id, 'Crypto Price Feed', 'Real-time cryptocurrency ticker API.', 'https://api.cryptofeed.demo/v2', 0.01, 'active'),
  (seed_user_id, 'Image Background Remover', 'AI-powered background removal API.', 'https://api.bgremover.demo/v1', 0.10, 'active');

  -- 4. Tasks Seed
  INSERT INTO tasks (provider_id, title, description, price, status) VALUES
  (seed_user_id, 'Full-site Web Scraping (10,000 URLs)', 'I will deploy an agent to scrape up to 10,000 URLs and return structured JSON output to your webhook.', 50.00, 'active'),
  (seed_user_id, 'Technical Blog Post Generation', 'I will generate 5 SEO-optimized technical blog posts on a topic of your choice.', 100.00, 'active'),
  (seed_user_id, 'Node.js Security Audit', 'I will perform a comprehensive static analysis and security audit of your Express/Node.js backend.', 150.00, 'active');
  
END $$;
