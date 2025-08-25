import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const DataTest: React.FC = () => {
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  const testDataFetching = async () => {
    setLoading(true);
    const testResults: Record<string, unknown> = {};

    try {
      // Test 1: Projects table
      console.log('Testing projects table...');
      const projectsResult = await supabase
        .from('projects')
        .select('*')
        .limit(5);
      
      testResults.projects = {
        success: !projectsResult.error,
        count: projectsResult.data?.length || 0,
        data: projectsResult.data,
        error: projectsResult.error?.message
      };

      // Test 2: Skills table
      console.log('Testing skills table...');
      const skillsResult = await supabase
        .from('skills')
        .select('*')
        .limit(5);
      
      testResults.skills = {
        success: !skillsResult.error,
        count: skillsResult.data?.length || 0,
        data: skillsResult.data,
        error: skillsResult.error?.message
      };

      // Test 3: Contact messages table
      console.log('Testing contact_messages table...');
      const messagesResult = await supabase
        .from('contact_messages')
        .select('*')
        .limit(5);
      
      testResults.contact_messages = {
        success: !messagesResult.error,
        count: messagesResult.data?.length || 0,
        data: messagesResult.data,
        error: messagesResult.error?.message
      };

      // Test 4: Hero content table
      console.log('Testing hero_content table...');
      const heroResult = await supabase
        .from('hero_content')
        .select('*')
        .limit(1)
        .single();
      
      testResults.hero_content = {
        success: !heroResult.error,
        data: heroResult.data,
        error: heroResult.error?.message
      };

      // Test 5: About content table
      console.log('Testing about_content table...');
      const aboutResult = await supabase
        .from('about_content')
        .select('*')
        .limit(1)
        .single();
      
      testResults.about_content = {
        success: !aboutResult.error,
        data: aboutResult.data,
        error: aboutResult.error?.message
      };

    } catch (globalError) {
      testResults.globalError = (globalError as Error).message;
    } finally {
      setResults(testResults);
      setLoading(false);
    }
  };

  const seedSampleData = async () => {
    setLoading(true);
    try {
      // Insert sample data if tables are empty
      
      // Sample hero content
      const { error: heroError } = await supabase
        .from('hero_content')
        .upsert({
          id: '1',
          title: 'Sajal Basnet',
          subtitle: 'Full-Stack Developer & IT Specialist',
          description: 'Passionate about creating innovative solutions and optimizing digital experiences.',
          cta_text: 'View My Work',
          updated_at: new Date().toISOString()
        });

      // Sample projects
      const { error: projectError } = await supabase
        .from('projects')
        .upsert([
          {
            id: '1',
            title: 'Portfolio Website',
            description: 'A modern portfolio website built with React and Supabase',
            project_type: 'Web Development',
            technologies: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
            is_featured: true,
            is_active: true,
            sort_order: 1,
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'E-commerce Platform',
            description: 'Full-stack e-commerce solution with admin panel',
            project_type: 'Web Development',
            technologies: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe'],
            is_featured: true,
            is_active: true,
            sort_order: 2,
            updated_at: new Date().toISOString()
          }
        ]);

      // Sample skills
      const { error: skillsError } = await supabase
        .from('skills')
        .upsert([
          {
            id: '1',
            name: 'React',
            icon: 'react',
            level: 90,
            category: 'Development',
            is_active: true,
            sort_order: 1,
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'TypeScript',
            icon: 'typescript',
            level: 85,
            category: 'Development',
            is_active: true,
            sort_order: 2,
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Node.js',
            icon: 'nodejs',
            level: 80,
            category: 'Development',
            is_active: true,
            sort_order: 3,
            updated_at: new Date().toISOString()
          }
        ]);

      setResults({
        seeding: {
          hero: !heroError,
          projects: !projectError,
          skills: !skillsError,
          heroError: heroError?.message,
          projectError: projectError?.message,
          skillsError: skillsError?.message
        }
      });

    } catch (error) {
      setResults({
        seedingError: (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Data Fetching Test</h1>
      
      <div className="space-x-4 mb-6">
        <button
          onClick={testDataFetching}
          disabled={loading}
          className="bg-blue-600 px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Data Fetching'}
        </button>
        
        <button
          onClick={seedSampleData}
          disabled={loading}
          className="bg-green-600 px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Seeding...' : 'Seed Sample Data'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([tableName, result]) => (
          <div key={tableName} className="bg-gray-900 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2 capitalize text-yellow-400">
              {tableName.replace(/_/g, ' ')}
            </h3>
            <pre className="text-sm overflow-auto text-gray-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataTest;