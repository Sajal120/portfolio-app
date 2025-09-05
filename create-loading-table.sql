-- Create loading_content table for managing loading screen content
CREATE TABLE IF NOT EXISTS loading_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  main_title TEXT NOT NULL DEFAULT 'Sajal',
  subtitle TEXT NOT NULL DEFAULT 'AI & IT Enthusiast',
  status_messages TEXT[] DEFAULT ARRAY[
    'Initializing development environment...',
    'Loading AI-enhanced tools...',
    'Configuring security protocols...',
    'Setting up IT infrastructure...',
    'Optimizing system performance...',
    'Ready to innovate...'
  ],
  show_progress_bar BOOLEAN DEFAULT TRUE,
  show_corner_decorations BOOLEAN DEFAULT TRUE,
  background_type TEXT DEFAULT 'gradient' CHECK (background_type IN ('gradient', 'solid', 'image')),
  background_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE loading_content ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view loading content" ON loading_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert loading content" ON loading_content
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update loading content" ON loading_content
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete loading content" ON loading_content
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Public access for reading loading content (for the loading page)
CREATE POLICY "Public can view loading content" ON loading_content
  FOR SELECT USING (true);

-- Insert default data
INSERT INTO loading_content (
  main_title, 
  subtitle, 
  status_messages,
  show_progress_bar,
  show_corner_decorations,
  background_type
) VALUES (
  'Sajal',
  'AI & IT Enthusiast',
  ARRAY[
    'Initializing development environment...',
    'Loading AI-enhanced tools...',
    'Configuring security protocols...',
    'Setting up IT infrastructure...',
    'Optimizing system performance...',
    'Ready to innovate...'
  ],
  TRUE,
  TRUE,
  'gradient'
) ON CONFLICT DO NOTHING;