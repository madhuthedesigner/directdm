-- DirectDM Database Schema
-- This migration creates all required tables for the Instagram Auto-Reply System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create instagram_accounts table
CREATE TABLE instagram_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ig_account_id TEXT UNIQUE NOT NULL,
  ig_username TEXT NOT NULL,
  ig_access_token TEXT NOT NULL,
  token_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_account ON instagram_accounts(user_id, ig_account_id);

-- Create automation_configs table
CREATE TABLE automation_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instagram_account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  
  llm_provider TEXT NOT NULL,
  llm_model TEXT NOT NULL,
  llm_api_key TEXT NOT NULL,
  
  system_prompt TEXT NOT NULL,
  system_prompt_updated_at TIMESTAMP,
  
  dm_auto_reply_enabled BOOLEAN DEFAULT TRUE,
  comment_auto_reply_enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_config ON automation_configs(user_id);

-- Create post_automation_settings table
CREATE TABLE post_automation_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_config_id UUID NOT NULL REFERENCES automation_configs(id) ON DELETE CASCADE,
  instagram_post_id TEXT NOT NULL,
  
  is_enabled BOOLEAN DEFAULT TRUE,
  keyword_triggers TEXT[] DEFAULT ARRAY[]::TEXT[],
  reply_to_all_comments BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(automation_config_id, instagram_post_id)
);

CREATE INDEX idx_post_settings ON post_automation_settings(automation_config_id, instagram_post_id);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_config_id UUID NOT NULL REFERENCES automation_configs(id) ON DELETE CASCADE,
  
  ig_message_id TEXT UNIQUE NOT NULL,
  message_type TEXT NOT NULL,
  sender_username TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  
  post_id TEXT,
  comment_id TEXT,
  conversation_id TEXT,
  
  processed_at TIMESTAMP,
  auto_reply_sent BOOLEAN DEFAULT FALSE,
  auto_reply_content TEXT,
  ai_model_used TEXT,
  processing_time_ms INT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_config_messages ON messages(automation_config_id, created_at DESC);
CREATE INDEX idx_sender ON messages(sender_id);
CREATE INDEX idx_processed ON messages(processed_at);

-- Create analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_config_id UUID NOT NULL REFERENCES automation_configs(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  
  dm_received INT DEFAULT 0,
  dm_auto_replied INT DEFAULT 0,
  comments_received INT DEFAULT 0,
  comments_auto_replied INT DEFAULT 0,
  ai_api_calls INT DEFAULT 0,
  ai_api_cost_usd DECIMAL(10, 4) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(automation_config_id, date)
);

CREATE INDEX idx_analytics ON analytics(automation_config_id, date DESC);

-- Enable Row-Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Row-Level Security Policies
-- Note: Replace auth.uid() with your actual authentication mechanism

-- Users: Can only access their own data
CREATE POLICY user_select_own ON users
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY user_update_own ON users
  FOR UPDATE
  USING (id = auth.uid());

-- Instagram Accounts: Users can only access their own accounts
CREATE POLICY instagram_accounts_select ON instagram_accounts
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY instagram_accounts_insert ON instagram_accounts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY instagram_accounts_update ON instagram_accounts
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY instagram_accounts_delete ON instagram_accounts
  FOR DELETE
  USING (user_id = auth.uid());

-- Automation Configs: Users can only access their own configs
CREATE POLICY automation_configs_select ON automation_configs
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY automation_configs_insert ON automation_configs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY automation_configs_update ON automation_configs
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY automation_configs_delete ON automation_configs
  FOR DELETE
  USING (user_id = auth.uid());

-- Post Automation Settings: Users can only access settings for their configs
CREATE POLICY post_settings_select ON post_automation_settings
  FOR SELECT
  USING (automation_config_id IN (
    SELECT id FROM automation_configs WHERE user_id = auth.uid()
  ));

CREATE POLICY post_settings_insert ON post_automation_settings
  FOR INSERT
  WITH CHECK (automation_config_id IN (
    SELECT id FROM automation_configs WHERE user_id = auth.uid()
  ));

CREATE POLICY post_settings_update ON post_automation_settings
  FOR UPDATE
  USING (automation_config_id IN (
    SELECT id FROM automation_configs WHERE user_id = auth.uid()
  ));

CREATE POLICY post_settings_delete ON post_automation_settings
  FOR DELETE
  USING (automation_config_id IN (
    SELECT id FROM automation_configs WHERE user_id = auth.uid()
  ));

-- Messages: Users can only access messages for their configs
CREATE POLICY messages_select ON messages
  FOR SELECT
  USING (automation_config_id IN (
    SELECT id FROM automation_configs WHERE user_id = auth.uid()
  ));

CREATE POLICY messages_insert ON messages
  FOR INSERT
  WITH CHECK (automation_config_id IN (
    SELECT id FROM automation_configs WHERE user_id = auth.uid()
  ));

-- Analytics: Users can only access their own analytics
CREATE POLICY analytics_select ON analytics
  FOR SELECT
  USING (automation_config_id IN (
    SELECT id FROM automation_configs WHERE user_id = auth.uid()
  ));

CREATE POLICY analytics_insert ON analytics
  FOR INSERT
  WITH CHECK (automation_config_id IN (
    SELECT id FROM automation_configs WHERE user_id = auth.uid()
  ));

CREATE POLICY analytics_update ON analytics
  FOR UPDATE
  USING (automation_config_id IN (
    SELECT id FROM automation_configs WHERE user_id = auth.uid()
  ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instagram_accounts_updated_at BEFORE UPDATE ON instagram_accounts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_configs_updated_at BEFORE UPDATE ON automation_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_automation_settings_updated_at BEFORE UPDATE ON post_automation_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
