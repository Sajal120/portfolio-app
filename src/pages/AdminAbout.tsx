import React, { useEffect, useState } from 'react';
import { 
  User, 
  Camera, 
  FloppyDisk as Save, 
  Plus,
  Trash,
  Upload,
  Eye
} from 'phosphor-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AboutContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  profile_image?: string;
  years_experience: number;
  projects_completed: number;
  technical_skills: number;
  created_at: string;
  updated_at: string;
}

const AdminAbout: React.FC = () => {
  const [content, setContent] = useState<AboutContent>({
    id: '',
    title: '',
    subtitle: '',
    description: '',
    profile_image: '',
    years_experience: 0,
    projects_completed: 0,
    technical_skills: 0,
    created_at: '',
    updated_at: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAboutContent();
  }, []);

  const loadAboutContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setContent(data);
      } else {
        // Create default content
        const defaultContent = {
          id: '1',
          title: 'About Me',
          subtitle: 'Passionate Developer & IT Specialist',
          description: 'I am a dedicated full-stack developer with expertise in modern web technologies and IT infrastructure. I love creating innovative solutions and optimizing digital experiences.',
          profile_image: '',
          years_experience: 3,
          projects_completed: 25,
          technical_skills: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setContent(defaultContent);
      }
    } catch (error) {
      console.error('Error loading about content:', error);
      toast.error('Failed to load about content');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-${Date.now()}.${fileExt}`;
      const filePath = `about/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      setContent(prev => ({
        ...prev,
        profile_image: publicUrlData.publicUrl
      }));

      toast.success('Profile image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const contentToSave = {
        ...content,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('about_content')
        .upsert(contentToSave);

      if (error) throw error;

      toast.success('About content saved successfully');
      loadAboutContent(); // Reload to get updated data
    } catch (error) {
      console.error('Error saving about content:', error);
      toast.error('Failed to save about content');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AboutContent, value: string | number) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const removeImage = () => {
    setContent(prev => ({
      ...prev,
      profile_image: ''
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
              About Section
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal information and achievements
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Image */}
        <div className="lg:col-span-1">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="mr-2" size={20} />
                Profile Image
              </CardTitle>
              <CardDescription>
                Upload your profile photo (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.profile_image ? (
                <div className="relative">
                  <img
                    src={content.profile_image}
                    alt="Profile"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 glass-card border-white/10"
                    onClick={removeImage}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ) : (
                <div className="w-full h-64 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <User size={48} className="mx-auto mb-4 text-white/50" />
                    <p className="text-sm text-muted-foreground">No image uploaded</p>
                  </div>
                </div>
              )}
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Button
                  variant="outline"
                  className="w-full glass-card border-white/10"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Your personal details and introduction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={content.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="About Me"
                    className="glass-card border-white/10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subtitle</label>
                  <Input
                    value={content.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    placeholder="Your professional title"
                    className="glass-card border-white/10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={content.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell your story..."
                  className="glass-card border-white/10 min-h-32"
                />
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Achievement Statistics</CardTitle>
              <CardDescription>
                Your professional achievements and experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Years of Experience</label>
                  <Input
                    type="number"
                    value={content.years_experience}
                    onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value) || 0)}
                    placeholder="3"
                    className="glass-card border-white/10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Projects Completed</label>
                  <Input
                    type="number"
                    value={content.projects_completed}
                    onChange={(e) => handleInputChange('projects_completed', parseInt(e.target.value) || 0)}
                    placeholder="25"
                    className="glass-card border-white/10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Technical Skills</label>
                  <Input
                    type="number"
                    value={content.technical_skills}
                    onChange={(e) => handleInputChange('technical_skills', parseInt(e.target.value) || 0)}
                    placeholder="15"
                    className="glass-card border-white/10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2" size={20} />
                Preview
              </CardTitle>
              <CardDescription>
                How this will appear on your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-white/5 rounded-xl">
                <div className="flex items-center gap-6 mb-6">
                  {content.profile_image && (
                    <img
                      src={content.profile_image}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{content.title || 'About Me'}</h3>
                    <p className="text-muted-foreground">{content.subtitle || 'Your professional title'}</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6">
                  {content.description || 'Your description will appear here...'}
                </p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{content.years_experience}</div>
                    <div className="text-xs text-muted-foreground">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">{content.projects_completed}</div>
                    <div className="text-xs text-muted-foreground">Projects Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{content.technical_skills}</div>
                    <div className="text-xs text-muted-foreground">Technical Skills</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAbout;