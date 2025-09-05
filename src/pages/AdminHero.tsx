import React, { useState, useEffect } from 'react';
import { FloppyDisk, Eye } from 'phosphor-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { supabase, HeroContent } from '../lib/supabase';
import toast from 'react-hot-toast';

const AdminHero: React.FC = () => {
  const [heroData, setHeroData] = useState<Partial<HeroContent>>({
    title: '',
    subtitle: '',
    description: '',
    cta_text: 'Hire Me'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHeroContent();
  }, []);

  const loadHeroContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hero_content')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setHeroData(data);
      }
    } catch (error) {
      console.error('Error loading hero content:', error);
      toast.error('Failed to load hero content');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof HeroContent, value: string) => {
    setHeroData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to save hero data to database
  const saveHeroDataToDatabase = async (dataToSave: Partial<HeroContent>) => {
    const saveData = {
      title: dataToSave.title || '',
      subtitle: dataToSave.subtitle || '',
      description: dataToSave.description || '',
      // sub_description: dataToSave.sub_description || '', // Disabled until DB column is added
      cta_text: dataToSave.cta_text || 'Hire Me',
      updated_at: new Date().toISOString()
    };

    if (dataToSave.id) {
      // Update existing
      const { error } = await supabase
        .from('hero_content')
        .update(saveData)
        .eq('id', dataToSave.id);

      if (error) throw error;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('hero_content')
        .insert([saveData])
        .select()
        .single();

      if (error) throw error;
      setHeroData(data);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving hero data:', heroData); // Debug log
      await saveHeroDataToDatabase(heroData);
      toast.success('Hero content saved successfully');
    } catch (error) {
      console.error('Error saving hero content:', error);
      toast.error('Failed to save hero content');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  if (loading && !heroData.title) {
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
              Hero Section
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage the main banner content that visitors see first
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handlePreview}
            className="glass-card border-white/10"
          >
            <Eye size={20} className="mr-2" />
            Preview
          </Button>
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
                <FloppyDisk size={20} className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>Content Settings</CardTitle>
            <CardDescription>
              Edit the text content for your hero section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Main Title
              </label>
              <Input
                id="title"
                placeholder="Hi, I'm Your Name"
                value={heroData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="glass-card border-white/10 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                The main headline visitors will see first
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="subtitle" className="text-sm font-medium">
                Subtitle
              </label>
              <Input
                id="subtitle"
                placeholder="AI & IT Enthusiast"
                value={heroData.subtitle || ''}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                className="glass-card border-white/10 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Your professional title or tagline
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder={`Developer | Analyst | IT Support Specialist.
Leveraging AI tools to enhance development workflows, security analysis, and system optimization. Creating efficient, intelligent solutions.`}
                value={heroData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="glass-card border-white/10 focus:border-primary resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Press Enter to create line breaks - they will appear exactly as you type them
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="cta_text" className="text-sm font-medium">
                Call-to-Action Button Text
              </label>
              <Input
                id="cta_text"
                placeholder="Hire Me"
                value={heroData.cta_text || ''}
                onChange={(e) => handleInputChange('cta_text', e.target.value)}
                className="glass-card border-white/10 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Text for the main action button
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>
            See how your hero section will look to visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-background via-background/95 to-background">
            <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-background/20" />
            
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center max-w-4xl">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    {heroData.title || 'Your Title Here'}
                  </span>
                  <br />
                  <span className="text-2xl md:text-3xl text-muted-foreground">
                    {heroData.subtitle || 'Your Subtitle'}
                  </span>
                </h1>
                
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  {heroData.description ? (
                    (() => {
                      // Split by line breaks and render each line
                      const lines = heroData.description.split('\n');
                      return lines.map((line, index) => (
                        <span key={index}>
                          {line}
                          {index < lines.length - 1 && <br />}
                        </span>
                      ));
                    })()
                  ) : (
                    'Your description will appear here...'
                  )}
                </p>
                
                <button className="btn-glow px-6 py-3 rounded-full font-semibold">
                  {heroData.cta_text || 'Call to Action'}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHero;