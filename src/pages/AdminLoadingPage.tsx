import React, { useEffect, useState } from 'react';
import { 
  Eye, 
  Save,
  Loader,
  Plus,
  Trash2,
  Image as ImageIcon,
  Palette
} from 'phosphor-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface LoadingData {
  main_title: string;
  subtitle: string;
  status_messages: string[];
  show_progress_bar: boolean;
  show_corner_decorations: boolean;
  background_type: 'gradient' | 'solid' | 'image';
  background_value: string;
}

const AdminLoadingPage: React.FC = () => {
  const [loadingData, setLoadingData] = useState<LoadingData>({
    main_title: 'Sajal',
    subtitle: 'AI & IT Enthusiast',
    status_messages: [
      'Initializing development environment...',
      'Loading AI-enhanced tools...',
      'Configuring security protocols...',
      'Setting up IT infrastructure...',
      'Optimizing system performance...',
      'Ready to innovate...'
    ],
    show_progress_bar: true,
    show_corner_decorations: true,
    background_type: 'gradient',
    background_value: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLoadingData();
  }, []);

  const loadLoadingData = async () => {
    try {
      const { data, error } = await supabase
        .from('loading_content')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error loading loading content:', error);
        return;
      }

      if (data) {
        setLoadingData({
          main_title: data.main_title || 'Sajal',
          subtitle: data.subtitle || 'AI & IT Enthusiast',
          status_messages: data.status_messages || [
            'Initializing development environment...',
            'Loading AI-enhanced tools...',
            'Configuring security protocols...',
            'Setting up IT infrastructure...',
            'Optimizing system performance...',
            'Ready to innovate...'
          ],
          show_progress_bar: data.show_progress_bar ?? true,
          show_corner_decorations: data.show_corner_decorations ?? true,
          background_type: data.background_type || 'gradient',
          background_value: data.background_value || ''
        });
      }
    } catch (error) {
      console.error('Exception loading loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { data: existingData } = await supabase
        .from('loading_content')
        .select('id')
        .limit(1)
        .single();

      let result;
      if (existingData) {
        // Update existing record
        result = await supabase
          .from('loading_content')
          .update({
            main_title: loadingData.main_title,
            subtitle: loadingData.subtitle,
            status_messages: loadingData.status_messages,
            show_progress_bar: loadingData.show_progress_bar,
            show_corner_decorations: loadingData.show_corner_decorations,
            background_type: loadingData.background_type,
            background_value: loadingData.background_value,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
      } else {
        // Create new record
        result = await supabase
          .from('loading_content')
          .insert([{
            main_title: loadingData.main_title,
            subtitle: loadingData.subtitle,
            status_messages: loadingData.status_messages,
            show_progress_bar: loadingData.show_progress_bar,
            show_corner_decorations: loadingData.show_corner_decorations,
            background_type: loadingData.background_type,
            background_value: loadingData.background_value
          }]);
      }

      if (result.error) throw result.error;

      toast.success('Loading page content updated successfully!');
    } catch (error) {
      console.error('Error saving loading content:', error);
      toast.error('Failed to save loading page content');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Open the main page to see loading screen
    window.open('/', '_blank');
  };

  const addStatusMessage = () => {
    setLoadingData(prev => ({
      ...prev,
      status_messages: [...prev.status_messages, 'New status message...']
    }));
  };

  const removeStatusMessage = (index: number) => {
    setLoadingData(prev => ({
      ...prev,
      status_messages: prev.status_messages.filter((_, i) => i !== index)
    }));
  };

  const updateStatusMessage = (index: number, value: string) => {
    setLoadingData(prev => ({
      ...prev,
      status_messages: prev.status_messages.map((msg, i) => i === index ? value : msg)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded-xl w-64 mb-2" />
          <div className="h-4 bg-white/5 rounded-xl w-96" />
        </div>
        <div className="h-96 bg-white/5 rounded-xl animate-pulse" />
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
              Loading Page
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize the loading screen that users see when visiting your portfolio
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handlePreview}
            className="glass-card border-white/10"
          >
            <Eye size={16} className="mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="btn-glow"
          >
            {saving ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
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
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Main Content Settings */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Loader className="mr-2" size={20} />
              Main Content
            </CardTitle>
            <CardDescription>
              Configure the primary text and title displayed on the loading screen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="main_title">Main Title</Label>
              <Input
                id="main_title"
                value={loadingData.main_title}
                onChange={(e) => setLoadingData(prev => ({ ...prev, main_title: e.target.value }))}
                placeholder="Enter main title (e.g., Your Name)"
                className="glass-card border-white/10 mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Large text displayed prominently during loading
              </p>
            </div>

            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={loadingData.subtitle}
                onChange={(e) => setLoadingData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Enter subtitle (e.g., AI & IT Enthusiast)"
                className="glass-card border-white/10 mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Smaller descriptive text below the main title
              </p>
            </div>

            <Separator className="border-white/10" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Status Messages</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addStatusMessage}
                  className="glass-card border-white/10"
                >
                  <Plus size={14} className="mr-1" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Messages that appear progressively during the loading process
              </p>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {loadingData.status_messages.map((message, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={message}
                        onChange={(e) => updateStatusMessage(index, e.target.value)}
                        placeholder={`Status message ${index + 1}`}
                        className="glass-card border-white/10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeStatusMessage(index)}
                      className="glass-card border-white/10 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Settings */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2" size={20} />
              Visual Settings
            </CardTitle>
            <CardDescription>
              Customize the appearance and visual elements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show_progress_bar">Progress Bar</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Show animated progress bar during loading
                </p>
              </div>
              <Switch
                id="show_progress_bar"
                checked={loadingData.show_progress_bar}
                onCheckedChange={(checked) => 
                  setLoadingData(prev => ({ ...prev, show_progress_bar: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show_corner_decorations">Corner Decorations</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Show corner border decorations
                </p>
              </div>
              <Switch
                id="show_corner_decorations"
                checked={loadingData.show_corner_decorations}
                onCheckedChange={(checked) => 
                  setLoadingData(prev => ({ ...prev, show_corner_decorations: checked }))
                }
              />
            </div>

            <Separator className="border-white/10" />

            <div>
              <Label htmlFor="background_type">Background Type</Label>
              <Select
                value={loadingData.background_type}
                onValueChange={(value: 'gradient' | 'solid' | 'image') =>
                  setLoadingData(prev => ({ ...prev, background_type: value }))
                }
              >
                <SelectTrigger className="glass-card border-white/10 mt-2">
                  <SelectValue placeholder="Select background type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gradient">Gradient</SelectItem>
                  <SelectItem value="solid">Solid Color</SelectItem>
                  <SelectItem value="image">Background Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loadingData.background_type !== 'gradient' && (
              <div>
                <Label htmlFor="background_value">
                  {loadingData.background_type === 'solid' ? 'Background Color' : 'Background Image URL'}
                </Label>
                <Input
                  id="background_value"
                  value={loadingData.background_value}
                  onChange={(e) => setLoadingData(prev => ({ ...prev, background_value: e.target.value }))}
                  placeholder={
                    loadingData.background_type === 'solid' 
                      ? 'Enter hex color (e.g., #1a1a1a)' 
                      : 'Enter image URL'
                  }
                  className="glass-card border-white/10 mt-2"
                />
              </div>
            )}

            <Separator className="border-white/10" />

            <div className="space-y-3">
              <Label>Current Configuration</Label>
              <div className="p-4 bg-white/5 rounded-xl text-xs font-mono">
                <div className="text-primary">Title: "{loadingData.main_title}"</div>
                <div className="text-secondary">Subtitle: "{loadingData.subtitle}"</div>
                <div className="text-accent">Status Messages: {loadingData.status_messages.length} items</div>
                <div className="text-muted-foreground">Progress Bar: {loadingData.show_progress_bar ? 'Enabled' : 'Disabled'}</div>
                <div className="text-muted-foreground">Decorations: {loadingData.show_corner_decorations ? 'Enabled' : 'Disabled'}</div>
                <div className="text-muted-foreground">Background: {loadingData.background_type}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Loader size={24} className="text-white animate-spin" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">How Loading Page Works</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>The loading page appears when users first visit your portfolio</li>
                <li>Status messages are displayed progressively based on loading progress (0-20%, 20-40%, etc.)</li>
                <li>The 3D animation and visual effects are part of the design and cannot be modified</li>
                <li>Changes take effect immediately after saving - test by refreshing your portfolio</li>
                <li>The loading duration is fixed but the content is fully customizable</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoadingPage;