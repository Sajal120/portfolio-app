import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  House, 
  User, 
  Folder, 
  EnvelopeSimple, 
  Gear, 
  SignOut, 
  List,
  ChartLine,
  Image,
  MessengerLogo,
  AddressBook,
  Sparkle
} from 'phosphor-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import toast from 'react-hot-toast';

const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
      console.error('Sign out error:', error);
    }
  };

  const menuItems = [
    {
      icon: ChartLine,
      label: 'Dashboard',
      path: '/admin',
      description: 'Overview and analytics'
    },
    {
      icon: Sparkle,
      label: 'Loading Page',
      path: '/admin/loading',
      description: 'Edit loading screen content'
    },
    {
      icon: User,
      label: 'Hero Section',
      path: '/admin/hero',
      description: 'Edit main banner content'
    },
    {
      icon: User,
      label: 'About',
      path: '/admin/about',
      description: 'Manage about section'
    },
    {
      icon: List,
      label: 'Skills',
      path: '/admin/skills',
      description: 'Add and edit skills'
    },
    {
      icon: Folder,
      label: 'Projects',
      path: '/admin/projects',
      description: 'Manage portfolio projects'
    },
    {
      icon: EnvelopeSimple,
      label: 'Contact Info',
      path: '/admin/contact',
      description: 'Update contact details'
    },
    {
      icon: AddressBook,
      label: 'Contact Section',
      path: '/admin/contact-section',
      description: 'Edit contact section content'
    },
    {
      icon: Gear,
      label: 'Footer Settings',
      path: '/admin/footer',
      description: 'Customize footer content'
    },
    {
      icon: MessengerLogo,
      label: 'Messages',
      path: '/admin/messages',
      description: 'View contact form submissions'
    },
    {
      icon: Image,
      label: 'Media',
      path: '/admin/media',
      description: 'Manage images and files'
    },
    {
      icon: Gear,
      label: 'Settings',
      path: '/admin/settings',
      description: 'Site configuration'
    },
    {
      icon: List,
      label: 'Data Seeder',
      path: '/admin/seeder',
      description: 'Initialize sample content'
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="glass-card border-white/10"
        >
          <List size={20} />
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="h-full glass-card border-r border-white/10 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h1 className="text-xl font-bold">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Portfolio CMS
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              ×
            </Button>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-primary text-white shadow-lg'
                      : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon 
                    size={20} 
                    className={`${isActive ? 'text-white' : 'group-hover:text-primary'} transition-colors`}
                  />
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${
                      isActive ? 'text-white' : 'group-hover:text-foreground'
                    }`}>
                      {item.label}
                    </p>
                    <p className={`text-xs ${
                      isActive ? 'text-white/80' : 'text-muted-foreground'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="space-y-2">
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
              >
                <House size={18} />
                <span className="text-sm">View Portfolio</span>
              </Link>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start px-4 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <SignOut size={18} className="mr-2" />
                <span className="text-sm">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-72">
        <main className="min-h-screen p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;