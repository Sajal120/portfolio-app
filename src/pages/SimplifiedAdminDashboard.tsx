import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Folder, 
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
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalSkills: 0
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

      setStats({
        totalProjects: projectsResult.count || 0,
        totalSkills: skillsResult.count || 0
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <CardTitle className="text-sm font-medium">Portfolio Status</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Live</div>
            <p className="text-xs text-muted-foreground">
              Website is active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
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
              onClick={() => window.location.href = '/admin/skills'}
            >
              <Users size={16} className="mr-2" />
              Manage Skills
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start glass-card border-white/10"
              onClick={() => window.location.href = '/'}
            >
              <Eye size={16} className="mr-2" />
              View Live Site
            </Button>
          </CardContent>
        </Card>

        {/* Site Status */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>
              Current status and details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <span className="text-sm">Contact Form</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span className="text-sm text-green-500">Email Direct</span>
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
              <span className="text-sm text-muted-foreground">v1.1.0</span>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-muted-foreground">
                Contact messages are sent directly via email. No database storage required.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Note */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Contact Form Setup</h3>
            <p className="text-muted-foreground mb-4">
              Your contact form sends emails directly to your inbox. Messages are not stored in the database for privacy and simplicity.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/contact-test'}
                className="glass-card border-white/10"
              >
                Test Contact Form
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/'}
                className="glass-card border-white/10"
              >
                View Live Portfolio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;