import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Folder, 
  EnvelopeSimple, 
  TrendUp, 
  Eye,
  Star,
  Clock
} from 'phosphor-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface DashboardStats {
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

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalSkills: 0,
    totalMessages: 0,
    unreadMessages: 0,
    recentMessages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get projects count
      const projectsResult = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get skills count
      const skillsResult = await supabase
        .from('skills')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get messages count
      const messagesResult = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true });

      // Get unread count
      const unreadResult = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      // Get recent messages
      const recentResult = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalProjects: projectsResult.count || 0,
        totalSkills: skillsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        unreadMessages: unreadResult.count || 0,
        recentMessages: recentResult.data || []
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      setStats(prev => ({
        ...prev,
        unreadMessages: prev.unreadMessages - 1,
        recentMessages: prev.recentMessages.map(msg =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      }));

      toast.success('Message marked as read');
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('Failed to update message');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded-xl w-64 mb-2" />
          <div className="h-4 bg-white/5 rounded-xl w-96" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Dashboard Overview
          </span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.email}! Here's what's happening with your portfolio.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/10 hover:bg-white/5 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Active portfolio projects
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 hover:bg-white/5 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills Listed</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.totalSkills}</div>
            <p className="text-xs text-muted-foreground">
              Technical skills showcased
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 hover:bg-white/5 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <EnvelopeSimple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Contact form submissions
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 hover:bg-white/5 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <TrendUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Messages */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Messages
                <Button variant="outline" size="sm" className="glass-card border-white/10">
                  <Eye size={16} className="mr-2" />
                  View All
                </Button>
              </CardTitle>
              <CardDescription>
                Latest contact form submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.recentMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <EnvelopeSimple size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No messages yet</p>
                </div>
              ) : (
                stats.recentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      message.is_read
                        ? 'border-white/10 bg-white/5'
                        : 'border-orange-500/30 bg-orange-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{message.name}</h4>
                        <p className="text-sm text-muted-foreground">{message.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock size={12} className="mr-1" />
                          {formatDate(message.created_at)}
                        </div>
                        {!message.is_read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markMessageAsRead(message.id)}
                            className="glass-card border-white/10 text-xs"
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.message}
                    </p>
                    {!message.is_read && (
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                        <span className="text-xs text-orange-500 font-medium">New message</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common management tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start glass-card border-white/10"
                onClick={() => window.location.href = '/admin/projects'}
              >
                <Folder size={16} className="mr-2" />
                Manage Projects
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start glass-card border-white/10"
                onClick={() => window.location.href = '/admin/hero'}
              >
                <Star size={16} className="mr-2" />
                Edit Hero Section
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start glass-card border-white/10"
                onClick={() => window.location.href = '/'}
              >
                <Eye size={16} className="mr-2" />
                View Live Site
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start glass-card border-white/10"
                onClick={() => toast.success('Feature coming soon!')}
              >
                <Users size={16} className="mr-2" />
                Site Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Site Status */}
          <Card className="glass-card border-white/10 mt-6">
            <CardHeader>
              <CardTitle>Site Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Portfolio Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span className="text-sm text-green-500">Live</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">CMS Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span className="text-sm text-green-500">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Updated</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(new Date().toISOString())}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">CMS Version</span>
                <span className="text-sm text-muted-foreground">v1.0.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;