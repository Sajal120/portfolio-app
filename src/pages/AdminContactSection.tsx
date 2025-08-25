import React, { useEffect, useState } from 'react';
import { 
  AddressBook, 
  FloppyDisk as Save, 
  Plus,
  Trash,
  Eye,
  Envelope,
  Phone,
  MapPin,
  Globe
} from 'phosphor-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ContactSectionContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const AdminContactSection: React.FC = () => {
  const [content, setContent] = useState<ContactSectionContent>({
    id: '',
    title: '',
    subtitle: '',
    description: '',
    created_at: '',
    updated_at: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContactSectionContent();
  }, []);

  const loadContactSectionContent = async () => {
    try {
      setLoading(true);
      
      // Try to load from contact_messages table metadata or create default content
      // Since we don't have a dedicated table, we'll use localStorage for now
      const savedContent = localStorage.getItem('contact_section_content');
      
      if (savedContent) {
        const parsedContent = JSON.parse(savedContent);
        setContent({
          ...parsedContent,
          id: '1'
        });
      } else {
        // Create default content
        const defaultContent = {
          id: '1',
          title: 'Get In Touch',
          subtitle: "Ready to bring your ideas to life? Let's discuss your next project",
          description: "I'm actively seeking opportunities in IT Support, Software Development, and Security Analysis. If you're looking for a dedicated professional who can troubleshoot complex systems, develop secure applications, or strengthen your cybersecurity posture, let's connect and discuss how I can contribute to your team!",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setContent(defaultContent);
      }
    } catch (error) {
      console.error('Error loading contact section content:', error);
      // Create default content on error
      const defaultContent = {
        id: '1',
        title: 'Get In Touch',
        subtitle: "Ready to bring your ideas to life? Let's discuss your next project",
        description: "I'm actively seeking opportunities in IT Support, Software Development, and Security Analysis. If you're looking for a dedicated professional who can troubleshoot complex systems, develop secure applications, or strengthen your cybersecurity posture, let's connect and discuss how I can contribute to your team!",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setContent(defaultContent);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const contentToSave = {
        title: content.title,
        subtitle: content.subtitle,
        description: content.description,
        updated_at: new Date().toISOString()
      };

      // Save to localStorage for now since we don't have a site_settings table
      localStorage.setItem('contact_section_content', JSON.stringify(contentToSave));

      // Update the content state with the new timestamp
      setContent(prev => ({
        ...prev,
        ...contentToSave
      }));

      toast.success('Contact section content saved successfully');
    } catch (error) {
      console.error('Error saving contact section content:', error);
      toast.error('Failed to save contact section content');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ContactSectionContent, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded-xl w-64 mb-2" />
          <div className="h-4 bg-white/5 rounded-xl w-96" />
        </div>
        <div className="grid gap-6">
          <div className="h-96 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Contact Section Content
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage the content for your contact section
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="btn-glow"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Content Form */}
        <div className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Section Header</CardTitle>
              <CardDescription>
                Main heading and subtitle for the contact section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Section Title</label>
                <Input
                  value={content.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Get In Touch"
                  className="glass-card border-white/10"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Subtitle</label>
                <Input
                  value={content.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="Ready to bring your ideas to life?"
                  className="glass-card border-white/10"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>
                Main description text that appears in the contact section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium mb-2 block">Contact Description</label>
                <Textarea
                  value={content.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your professional focus and what you're looking for..."
                  className="glass-card border-white/10 min-h-32"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2" size={20} />
                Live Preview
              </CardTitle>
              <CardDescription>
                How your contact section will appear on the portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-white/5 rounded-xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    <span className="bg-gradient-primary bg-clip-text text-transparent">
                      {content.title || 'Get In Touch'}
                    </span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                    {content.subtitle || "Ready to bring your ideas to life? Let's discuss your next project"}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-glow">Let's Connect</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {content.description || "I'm actively seeking opportunities in IT Support, Software Development, and Security Analysis..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Content Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Title Length</span>
                <span className="text-sm font-medium">{content.title.length} characters</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Subtitle Length</span>
                <span className="text-sm font-medium">{content.subtitle.length} characters</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Description Length</span>
                <span className="text-sm font-medium">{content.description.length} characters</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Updated</span>
                <span className="text-sm text-muted-foreground">
                  {content.updated_at ? new Date(content.updated_at).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Related Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start glass-card border-white/10"
                onClick={() => window.location.href = '/admin/contact'}
              >
                <AddressBook size={16} className="mr-2" />
                Manage Contact Info
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start glass-card border-white/10"
                onClick={() => window.location.href = '/admin/messages'}
              >
                <Envelope size={16} className="mr-2" />
                View Messages
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminContactSection;