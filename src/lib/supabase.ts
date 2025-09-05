import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key are required. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
  background_image?: string;
  created_at: string;
  updated_at: string;
}

export interface LoadingContent {
  id: string;
  name: string;
  subtitle: string;
  status_messages: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AboutContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  profile_image?: string;
  years_experience: number;
  projects_completed: number;
  technical_skills: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  level: number;
  category: 'AI Tools' | 'Development' | 'Security' | 'IT Support';
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  original_image_url?: string;
  project_type: string;
  github_url?: string;
  live_url?: string;
  technologies: string[];
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactInfo {
  id: string;
  phone: string;
  email: string;
  location: string;
  github_url?: string;
  linkedin_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  site_title: string;
  site_description: string;
  meta_keywords?: string;
  google_analytics_id?: string;
  created_at: string;
  updated_at: string;
}

// Helper functions for authentication
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};

export const isUserAdmin = async () => {
  const user = await getCurrentUser();
  if (!user) return false;

  // Simple email-based check to avoid RLS issues
  if (user.email === 'basnetsajal120@gmail.com') {
    return true;
  }

  // Try the database check with error handling
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (error) {
      console.warn('Error checking admin status, falling back to email check:', error);
      return user.email === 'basnetsajal120@gmail.com';
    }

    return profile?.is_admin || false;
  } catch (err) {
    console.warn('Exception checking admin status, falling back to email check:', err);
    return user.email === 'basnetsajal120@gmail.com';
  }
};

// Auth functions
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

// Storage functions
export const uploadFile = async (file: File, bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('Error uploading file:', error);
    return { data: null, error };
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { data: { ...data, publicUrl: publicUrlData.publicUrl }, error: null };
};

export const deleteFile = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  return { data, error };
};

// Database helper functions
export const getHeroContent = async () => {
  const { data, error } = await supabase
    .from('hero_content')
    .select('*')
    .limit(1)
    .single();
  
  return { data, error };
};

export const getAboutContent = async () => {
  const { data, error } = await supabase
    .from('about_content')
    .select('*')
    .limit(1)
    .single();
  
  return { data, error };
};

export const getLoadingContent = async () => {
  const { data, error } = await supabase
    .from('loading_content')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  return { data, error };
};

export const getSkills = async (category?: string) => {
  let query = supabase
    .from('skills')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getProjects = async (featured?: boolean) => {
  let query = supabase
    .from('projects')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (featured !== undefined) {
    query = query.eq('is_featured', featured);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getContactInfo = async () => {
  const { data, error } = await supabase
    .from('contact_info')
    .select('*')
    .limit(1)
    .single();
  
  return { data, error };
};

export const getSiteSettings = async () => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .single();
  
  return { data, error };
};

export const submitContactMessage = async (name: string, email: string, message: string) => {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert([{ name, email, message }])
    .select()
    .single();
  
  return { data, error };
};