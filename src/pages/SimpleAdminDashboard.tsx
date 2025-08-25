import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface DashboardData {
  totalProjects: number;
  totalSkills: number;
  totalMessages: number;
  unreadMessages: number;
  recentMessages: Array<{
    id: string;
    name: string;
    email: string;
    message: string;
    created_at: string;
    is_read: boolean;
  }>;
}

const SimpleAdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading dashboard data...');

      // Test each query individually with proper error handling
      const projectsResult = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const skillsResult = await supabase
        .from('skills')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const messagesResult = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true });

      const unreadResult = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      const recentResult = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      console.log('Query results:', {
        projects: projectsResult,
        skills: skillsResult,
        messages: messagesResult,
        unread: unreadResult,
        recent: recentResult
      });

      // Check for errors
      if (projectsResult.error) throw new Error(`Projects: ${projectsResult.error.message}`);
      if (skillsResult.error) throw new Error(`Skills: ${skillsResult.error.message}`);
      if (messagesResult.error) throw new Error(`Messages: ${messagesResult.error.message}`);
      if (unreadResult.error) throw new Error(`Unread: ${unreadResult.error.message}`);
      if (recentResult.error) throw new Error(`Recent: ${recentResult.error.message}`);

      setData({
        totalProjects: projectsResult.count || 0,
        totalSkills: skillsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        unreadMessages: unreadResult.count || 0,
        recentMessages: recentResult.data || []
      });

    } catch (err) {
      console.error('Dashboard loading error:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Loading Dashboard...</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-4 bg-white/10 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Dashboard Error</h1>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
        <button 
          onClick={loadData}
          className="mt-4 bg-blue-600 px-4 py-2 rounded text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Simple Admin Dashboard</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-sm text-blue-300 mb-1">Projects</h3>
          <p className="text-2xl font-bold text-white">{data?.totalProjects || 0}</p>
        </div>
        
        <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
          <h3 className="text-sm text-green-300 mb-1">Skills</h3>
          <p className="text-2xl font-bold text-white">{data?.totalSkills || 0}</p>
        </div>
        
        <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
          <h3 className="text-sm text-purple-300 mb-1">Messages</h3>
          <p className="text-2xl font-bold text-white">{data?.totalMessages || 0}</p>
        </div>
        
        <div className="bg-orange-600/20 border border-orange-500/30 rounded-lg p-4">
          <h3 className="text-sm text-orange-300 mb-1">Unread</h3>
          <p className="text-2xl font-bold text-white">{data?.unreadMessages || 0}</p>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-gray-900/50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Messages</h3>
        
        {!data?.recentMessages || data.recentMessages.length === 0 ? (
          <p className="text-gray-400">No messages yet</p>
        ) : (
          <div className="space-y-3">
            {data.recentMessages.map((message, index: number) => (
              <div key={message.id || index} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white">{message.name}</h4>
                  <span className="text-xs text-gray-400">
                    {new Date(message.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{message.email}</p>
                <p className="text-sm text-gray-400">{message.message}</p>
                {!message.is_read && (
                  <div className="mt-2">
                    <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    <span className="text-xs text-orange-400">Unread</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="bg-gray-900/30 rounded-lg p-4">
        <h3 className="text-lg font-bold text-white mb-2">Debug Info</h3>
        <pre className="text-xs text-gray-400 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SimpleAdminDashboard;