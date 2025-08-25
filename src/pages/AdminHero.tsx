import React, { useState, useEffect } from 'react';
import { FloppyDisk, Upload, Eye } from 'phosphor-react';
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
    cta_text: 'Hire Me',
    background_image: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');

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
        setPreviewImage(data.background_image || '');
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-bg-${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      const imageUrl = publicUrlData.publicUrl;
      setHeroData(prev => ({
        ...prev,
        background_image: imageUrl
      }));
      setPreviewImage(imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const saveData = {
        title: heroData.title || '',
        subtitle: heroData.subtitle || '',
        description: heroData.description || '',
        cta_text: heroData.cta_text || 'Hire Me',
        background_image: heroData.background_image || null,
        updated_at: new Date().toISOString()
      };

      if (heroData.id) {
        // Update existing
        const { error } = await supabase
          .from('hero_content')
          .update(saveData)
          .eq('id', heroData.id);

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
                placeholder="A brief description of who you are and what you do..."
                value={heroData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="glass-card border-white/10 focus:border-primary resize-none"
              />
              <p className="text-xs text-muted-foreground">
                A compelling description of your skills and experience
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

        {/* Background Image */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>Background Image</CardTitle>
            <CardDescription>
              Upload a background image for the hero section (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="hero-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="hero-image"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload size={32} className="text-muted-foreground" />
                  <div>
                    <p className="font-medium">Upload background image</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </label>
              </div>

              {/* Image Preview */}
              {previewImage && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preview</label>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted/20">
                    <img
                      src={previewImage}
                      alt="Hero background preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-background/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">
                          {heroData.title || 'Preview Title'}
                        </h2>
                        <p className="text-white/80">
                          {heroData.subtitle || 'Preview Subtitle'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Remove Image */}
              {heroData.background_image && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setHeroData(prev => ({ ...prev, background_image: '' }));
                    setPreviewImage('');
                  }}
                  className="w-full glass-card border-white/10 text-destructive hover:bg-destructive/10"
                >
                  Remove Background Image
                </Button>
              )}
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
            {previewImage && (
              <img
                src={previewImage}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
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
                  {heroData.description || 'Your description will appear here...'}
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