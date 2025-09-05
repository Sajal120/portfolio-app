import React, { useEffect, useState } from 'react';
import { 
  Sparkle,
  Plus,
  Trash,
  FloppyDisk,
  WarningCircle
} from 'phosphor-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface LoadingContent {
  id: string;
  name: string;
  subtitle: string;
  status_messages: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminLoading: React.FC = () => {
  const [loadingContent, setLoadingContent] = useState<LoadingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    status_messages: ['']
  });

  useEffect(() => {
    loadLoadingContent();
  }, []);

  const loadLoadingContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loading_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading content:', error);
        // If no content exists, use defaults
        const defaultContent = {
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setLoadingContent(defaultContent);
        setFormData({
          name: defaultContent.name,
          subtitle: defaultContent.subtitle,
          status_messages: [...defaultContent.status_messages]
        });
      } else {
        setLoadingContent(data);
        setFormData({
          name: data.name,
          subtitle: data.subtitle,
          status_messages: [...data.status_messages]
        });
      }
    } catch (error) {
      console.error('Error loading loading content:', error);
      toast.error('Failed to load loading content');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatusMessageChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      status_messages: prev.status_messages.map((msg, i) => i === index ? value : msg)
    }));
  };

  const addStatusMessage = () => {
    setFormData(prev => ({
      ...prev,
      status_messages: [...prev.status_messages, '']
    }));
  };

  const removeStatusMessage = (index: number) => {
    if (formData.status_messages.length <= 1) {
      toast.error('At least one status message is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      status_messages: prev.status_messages.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subtitle.trim()) {
      toast.error('Name and subtitle are required');
      return;
    }

    if (formData.status_messages.some(msg => !msg.trim())) {
      toast.error('All status messages must have content');
      return;
    }

    try {
      setSaving(true);

      if (loadingContent?.id) {
        // Update existing content
        const { error } = await supabase
          .from('loading_content')
          .update({
            name: formData.name.trim(),
            subtitle: formData.subtitle.trim(),
            status_messages: formData.status_messages.map(msg => msg.trim()),
            updated_at: new Date().toISOString()
          })
          .eq('id', loadingContent.id);

        if (error) {
          console.error('Update error:', error);
          if (error.message.includes('relation "loading_content" does not exist')) {
            toast.error('Database table not found. Please run the SQL migration first.');
          } else {
            toast.error(`Failed to update loading content: ${error.message}`);
          }
          return;
        }
      } else {
        // Create new content
        const { data, error } = await supabase
          .from('loading_content')
          .insert([{
            name: formData.name.trim(),
            subtitle: formData.subtitle.trim(),
            status_messages: formData.status_messages.map(msg => msg.trim()),
            is_active: true
          }])
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          if (error.message.includes('relation "loading_content" does not exist')) {
            toast.error('Database table not found. Please run the SQL migration first.');
          } else {
            toast.error(`Failed to create loading content: ${error.message}`);
          }
          return;
        }
        setLoadingContent(data);
      }

      toast.success('Loading content updated successfully!');
      loadLoadingContent(); // Reload to get fresh data
    } catch (error: unknown) {
      console.error('Error saving loading content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('relation "loading_content" does not exist')) {
        toast.error('Database table not found. Please run the SQL migration in Supabase first.');
      } else {
        toast.error(`Failed to save loading content: ${errorMessage}`);
      }
    } finally {
      setSaving(false);
    }
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
              Loading Page Content
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize the text content displayed during the loading animation
          </p>
        </div>
        <Badge variant="outline" className="glass-card border-white/10">
          <Sparkle className="mr-1" size={14} />
          Dynamic Content
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkle className="mr-2" size={20} />
                Edit Loading Content
              </CardTitle>
              <CardDescription>
                Update the name, subtitle, and status messages shown during loading
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Main Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Sajal"
                  className="glass-card border-white/10 mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The large name displayed during loading
                </p>
              </div>

              {/* Subtitle */}
              <div>
                <Label htmlFor="subtitle" className="text-sm font-medium">
                  Subtitle
                </Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="e.g., AI & IT Enthusiast"
                  className="glass-card border-white/10 mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The subtitle text below the main name
                </p>
              </div>

              {/* Status Messages */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">
                    Loading Status Messages
                  </Label>
                  <Button
                    type="button"
                    onClick={addStatusMessage}
                    size="sm"
                    className="btn-glow"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Message
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.status_messages.map((message, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Input
                          value={message}
                          onChange={(e) => handleStatusMessageChange(index, e.target.value)}
                          placeholder={`Status message ${index + 1}`}
                          className="glass-card border-white/10"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeStatusMessage(index)}
                        variant="outline"
                        size="sm"
                        className="glass-card border-white/10"
                        disabled={formData.status_messages.length <= 1}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Messages shown progressively as the loading bar fills up (0-20%, 20-40%, etc.)
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-white/10">
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
                      <FloppyDisk size={16} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-base">Loading Preview</CardTitle>
              <CardDescription>
                How your content will appear
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Preview */}
              <div>
                <Label className="text-xs text-muted-foreground">Main Name:</Label>
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mt-1">
                  {formData.name || 'Sajal'}
                </div>
              </div>

              {/* Subtitle Preview */}
              <div>
                <Label className="text-xs text-muted-foreground">Subtitle:</Label>
                <div className="text-lg text-muted-foreground font-light mt-1">
                  {formData.subtitle || 'AI & IT Enthusiast'}
                </div>
              </div>

              {/* Status Messages Preview */}
              <div>
                <Label className="text-xs text-muted-foreground">Status Messages:</Label>
                <div className="space-y-2 mt-2">
                  {formData.status_messages.map((message, index) => (
                    <div key={index} className="text-sm text-muted-foreground/80 p-2 rounded border border-white/10">
                      <span className="text-xs text-primary">
                        {index * 16 + (index === 0 ? 0 : 4)}%-{Math.min((index + 1) * 16 + 4, 100)}%:
                      </span>
                      <br />
                      {message || `Status message ${index + 1}`}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="glass-card border-white/10 mt-6">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <WarningCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium">Important Notes:</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• Changes take effect immediately</li>
                    <li>• Loading animation timing remains unchanged</li>
                    <li>• Status messages cycle based on progress %</li>
                    <li>• Keep messages concise for best display</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminLoading;