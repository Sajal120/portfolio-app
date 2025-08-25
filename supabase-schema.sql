-- Portfolio CMS Database Schema for Supabase
-- Run these SQL commands in your Supabase SQL Editor

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table for admin users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hero_content table
CREATE TABLE hero_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_text TEXT NOT NULL DEFAULT 'Hire Me',
  background_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create about_content table
CREATE TABLE about_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  profile_image TEXT,
  years_experience INTEGER DEFAULT 3,
  projects_completed INTEGER DEFAULT 15,
  technical_skills INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skills table
CREATE TABLE skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 0 AND level <= 100),
  category TEXT NOT NULL CHECK (category IN ('AI Tools', 'Development', 'Security', 'IT Support')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  project_type TEXT NOT NULL,
  github_url TEXT,
  live_url TEXT,
  technologies TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_info table
CREATE TABLE contact_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  github_url TEXT,
  linkedin_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_messages table for form submissions
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_settings table for general configuration
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_title TEXT NOT NULL DEFAULT 'Sajal Basnet - Portfolio',
  site_description TEXT NOT NULL DEFAULT 'AI & IT Enthusiast Portfolio',
  meta_keywords TEXT,
  google_analytics_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON hero_content FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON about_content FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON skills FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON contact_info FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON site_settings FOR SELECT USING (true);

-- Create policies for admin access
CREATE POLICY "Allow admin full access" ON profiles 
  FOR ALL USING (auth.uid() = id AND is_admin = true);

CREATE POLICY "Allow admin insert" ON hero_content 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin update" ON hero_content 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin delete" ON hero_content 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Apply the same admin policies to other tables
CREATE POLICY "Allow admin insert" ON about_content 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin update" ON about_content 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin delete" ON about_content 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin insert" ON skills 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin update" ON skills 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin delete" ON skills 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin insert" ON projects 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin update" ON projects 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin delete" ON projects 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin insert" ON contact_info 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin update" ON contact_info 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin delete" ON contact_info 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin read" ON contact_messages 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin update" ON contact_messages 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin delete" ON contact_messages 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow anyone to insert contact messages
CREATE POLICY "Allow public insert" ON contact_messages 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin insert" ON site_settings 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin update" ON site_settings 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Allow admin delete" ON site_settings 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Create function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert default data
INSERT INTO hero_content (title, subtitle, description, cta_text) VALUES 
('Hi, I''m Sajal', 'AI & IT Enthusiast', 'Developer | Analyst | IT Support Specialist. Leveraging AI tools to enhance development workflows, security analysis, and system optimization. Creating efficient, intelligent solutions.', 'Hire Me');

INSERT INTO about_content (title, subtitle, description, profile_image, years_experience, projects_completed, technical_skills) VALUES 
('About Me', 'Passionate about creating digital solutions that make a difference', 'Versatile IT professional with comprehensive expertise across software development, security analysis, and IT support. Master of Software Development – Swinburne University (Sep 2022 – May 2024) | GPA: 3.688/4.0 | Golden Key International Honour Society – Top 15% Enhanced by AI tools and modern automation to deliver innovative, efficient solutions.', '/lovable-uploads/7957a48c-b6ce-4e62-a999-09a1565abddb.png', 3, 15, 20);

INSERT INTO contact_info (phone, email, location, github_url, linkedin_url, bio) VALUES 
('+61 424 425 793', 'basnetsajal120@gmail.com', 'Auburn, Sydney, NSW', 'https://github.com/Sajal120', 'https://linkedin.com/in/sajal-basnet-7926aa188', 'I''m actively seeking opportunities in IT Support, Software Development, and Security Analysis. If you''re looking for a dedicated professional who can troubleshoot complex systems, develop secure applications, or strengthen your cybersecurity posture, let''s connect and discuss how I can contribute to your team!');

INSERT INTO site_settings (site_title, site_description, meta_keywords) VALUES 
('Sajal Basnet - Portfolio', 'AI & IT Enthusiast Portfolio - Software Development, Security Analysis, IT Support', 'portfolio, developer, AI, IT support, security analyst, React, JavaScript, Python');

-- Insert skills data
INSERT INTO skills (name, icon, level, category, sort_order) VALUES 
-- AI Tools
('AI Agents', '🤖', 92, 'AI Tools', 1),
('OpenAI API', '🌟', 95, 'AI Tools', 2),
('Claude API', '🎭', 90, 'AI Tools', 3),
('AI Integration', '🔗', 88, 'AI Tools', 4),
('Prompt Engineering', '🎯', 95, 'AI Tools', 5),
('AI-Assisted Coding', '💻', 92, 'AI Tools', 6),
('LangChain', '🔗', 85, 'AI Tools', 7),
('Hugging Face', '🤗', 80, 'AI Tools', 8),

-- Development
('JavaScript', '🟨', 95, 'Development', 1),
('React', '⚛️', 95, 'Development', 2),
('TypeScript', '🔷', 88, 'Development', 3),
('Python', '🐍', 88, 'Development', 4),
('Node.js', '💚', 90, 'Development', 5),
('PHP', '🐘', 85, 'Development', 6),
('C#', '🔵', 82, 'Development', 7),
('Java', '☕', 80, 'Development', 8),
('Next.js', '⚡', 88, 'Development', 9),
('Supabase', '⚡', 90, 'Development', 10),

-- Security
('Vulnerability Assessment', '🔍', 85, 'Security', 1),
('Risk Management', '⚖️', 88, 'Security', 2),
('Incident Response', '🚨', 85, 'Security', 3),
('SIEM (Splunk)', '📊', 80, 'Security', 4),
('Network Security', '🌐', 85, 'Security', 5),
('Secure Coding', '🔐', 90, 'Security', 6),

-- IT Support
('Troubleshooting', '🛠️', 95, 'IT Support', 1),
('Windows Administration', '🪟', 92, 'IT Support', 2),
('macOS Support', '🍎', 88, 'IT Support', 3),
('Linux Basics', '🐧', 82, 'IT Support', 4),
('Microsoft 365', '📊', 92, 'IT Support', 5),
('Network Support', '📡', 85, 'IT Support', 6);

-- Insert projects data
INSERT INTO projects (title, description, image_url, project_type, github_url, live_url, technologies, sort_order) VALUES 
('Movie Discovery Platform', 'A modern movie platform built with React and TMDB API featuring real-time data, advanced search, and personalized recommendations.', '/src/assets/movie-platform.jpg', 'Web Application', 'https://github.com/Sajal120', '#', ARRAY['React', 'JavaScript', 'TMDB API', 'CSS3'], 1),
('DevOps Cost Optimizer', 'Automated AWS cost tracking solution using Terraform and Python, reducing cloud spend by 30% through intelligent resource management.', '/src/assets/devops-optimizer.jpg', 'DevOps Tool', 'https://github.com/Sajal120', '#', ARRAY['Python', 'AWS', 'Terraform', 'Grafana'], 2),
('3D Portfolio Website', 'Immersive portfolio experience featuring 3D animations, smooth scrolling, and interactive elements built with cutting-edge web technologies.', '/src/assets/portfolio-3d.jpg', 'Portfolio', 'https://github.com/Sajal120', '#', ARRAY['React', 'Three.js', 'GSAP', 'Spline'], 3),
('Marketplace Bidding System', 'Secure online auction platform with real-time bidding, payment integration, and comprehensive user management system.', '/src/assets/marketplace-bidding.jpg', 'E-commerce', 'https://github.com/Sajal120', '#', ARRAY['PHP', 'JavaScript', 'Ajax', 'MySQL'], 4),
('VR Experience Platform', 'Immersive VR experiences using Present4D with panoramic content optimization for multi-device compatibility.', '/src/assets/vr-platform.jpg', 'VR Application', 'https://github.com/Sajal120', '#', ARRAY['VR', 'Present4D', 'JavaScript', 'WebXR'], 5),
('Fertility Health App', 'Cross-platform women''s health application built with Xamarin featuring cycle tracking, interactive charts and data visualization for informed reproductive health decisions.', '/src/assets/fertility-app-women.jpg', 'Mobile App', 'https://github.com/Sajal120', '#', ARRAY['Xamarin', 'C#', 'Charts', 'Mobile'], 6);