import { useState, useEffect } from 'react';
import { getLoadingContent, LoadingContent } from '../lib/supabase';

export const useLoadingContent = () => {
  const [content, setContent] = useState<LoadingContent>({
    id: '',
    name: 'Sajal',
    subtitle: 'AI & IT Enthusiast',
    status_messages: [
      'Initializing development environment...',
      'Loading AI-enhanced tools...',
      'Configuring security protocols...',
      'Setting up IT infrastructure...',
      'Optimizing system performance...',
      'Ready to innovate...'
    ],
    is_active: true,
    created_at: '',
    updated_at: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const { data, error } = await getLoadingContent();
        
        if (data && !error) {
          setContent(data);
        }
        // If error or no data, keep default content
      } catch (error) {
        console.error('Error loading loading content:', error);
        // Keep default content on error
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  return { content, loading };
};