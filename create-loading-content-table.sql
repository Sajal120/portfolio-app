-- Create loading_content table for managing loading page text content
CREATE TABLE IF NOT EXISTS loading_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Sajal',
  subtitle TEXT NOT NULL DEFAULT 'AI & IT Enthusiast',
  status_messages JSONB NOT NULL DEFAULT '[
    "Initializing development environment...",
    "Loading AI-enhanced tools...",
    "Configuring security protocols...",
    "Setting up IT infrastructure...",
    "Optimizing system performance...",
    "Ready to innovate..."
  ]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default loading content
INSERT INTO loading_content (name, subtitle, status_messages, is_active) VALUES 
(
  'Sajal',
  'AI & IT Enthusiast',
  '[
    "Initializing development environment...",
    "Loading AI-enhanced tools...",
    "Configuring security protocols...",
    "Setting up IT infrastructure...",
    "Optimizing system performance...",
    "Ready to innovate..."
  ]',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE loading_content ENABLE ROW LEVEL SECURITY;

-- Create policies for loading_content
CREATE POLICY "Allow public read access to loading_content" ON loading_content FOR SELECT USING (true);

CREATE POLICY "Allow admin users to manage loading_content" ON loading_content
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email = 'basnetsajal120@gmail.com'
  )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_loading_content_updated_at 
    BEFORE UPDATE ON loading_content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();