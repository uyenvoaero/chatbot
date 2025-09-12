-- Migration to add lead analysis columns to conversations table
-- Run this in your Supabase SQL editor

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_industry TEXT,
ADD COLUMN IF NOT EXISTS customer_problem TEXT,
ADD COLUMN IF NOT EXISTS customer_availability TEXT,
ADD COLUMN IF NOT EXISTS customer_consultation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS special_notes TEXT,
ADD COLUMN IF NOT EXISTS lead_quality TEXT CHECK (lead_quality IN ('good', 'ok', 'spam')),
ADD COLUMN IF NOT EXISTS analysis_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS analysis_date TIMESTAMP WITH TIME ZONE;

-- Add index for lead quality filtering
CREATE INDEX IF NOT EXISTS idx_conversations_lead_quality ON conversations(lead_quality);
CREATE INDEX IF NOT EXISTS idx_conversations_analysis_completed ON conversations(analysis_completed);

-- Migration to add lead analysis columns to conversations table
-- Run this in your Supabase SQL editor

ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_industry TEXT,
ADD COLUMN IF NOT EXISTS customer_problem TEXT,
ADD COLUMN IF NOT EXISTS customer_availability TEXT,
ADD COLUMN IF NOT EXISTS customer_consultation BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS special_notes TEXT,
ADD COLUMN IF NOT EXISTS lead_quality TEXT CHECK (lead_quality IN ('good', 'ok', 'spam')),
ADD COLUMN IF NOT EXISTS analysis_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS analysis_date TIMESTAMP WITH TIME ZONE;

-- Add index for lead quality filtering
CREATE INDEX IF NOT EXISTS idx_conversations_lead_quality ON conversations(lead_quality);
CREATE INDEX IF NOT EXISTS idx_conversations_analysis_completed ON conversations(analysis_completed);