import React, { useState, useEffect } from 'react';
import { FloppyDisk, Eye, Phone, EnvelopeSimple, MapPin, GithubLogo, LinkedinLogo } from 'phosphor-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ContactData {
  id?: string;
  phone: string;
  email: string;
  location: string;
  github_url: string;
  linkedin_url: string;
  bio: string;
}

const SimpleContactAdmin: React.FC = () => {
  const [contactData, setContactData] = useState<ContactData>({
    phone: '',
    email: '',
    location: '',
    github_url: '',
    linkedin_url: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContactData();
  }, []);

  const loadContactData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setContactData(data);
      }
    } catch (error) {
      console.error('Error loading contact data:', error);
      toast.error('Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContactData, value: string) => {
    setContactData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const saveData = {
        ...contactData,
        updated_at: new Date().toISOString()
      };

      if (contactData.id) {
        // Update existing
        const { error } = await supabase
          .from('contact_info')
          .update(saveData)
          .eq('id', contactData.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('contact_info')
          .insert([{
            ...saveData,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        setContactData(data);
      }

      toast.success('Contact information saved successfully');
    } catch (error) {
      console.error('Error saving contact data:', error);
      toast.error('Failed to save contact information');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  if (loading && !contactData.phone) {
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
              Contact Information
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your contact details and social media links
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
            <CardTitle>Contact Details</CardTitle>
            <CardDescription>
              Edit your contact information and social media links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium flex items-center">
                <Phone size={16} className="mr-2" />
                Phone Number
              </label>
              <Input
                id="phone"
                placeholder="+61 424 425 793"
                value={contactData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="glass-card border-white/10 focus:border-primary"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium flex items-center">
                <EnvelopeSimple size={16} className="mr-2" />
                Email Address
              </label>
              <Input
                id="email"
                placeholder="your@email.com"
                type="email"
                value={contactData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="glass-card border-white/10 focus:border-primary"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium flex items-center">
                <MapPin size={16} className="mr-2" />
                Location
              </label>
              <Input
                id="location"
                placeholder="City, State, Country"
                value={contactData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="glass-card border-white/10 focus:border-primary"
              />
            </div>

            {/* GitHub URL */}
            <div className="space-y-2">
              <label htmlFor="github_url" className="text-sm font-medium flex items-center">
                <GithubLogo size={16} className="mr-2" />
                GitHub Profile
              </label>
              <Input
                id="github_url"
                placeholder="https://github.com/yourusername"
                value={contactData.github_url}
                onChange={(e) => handleInputChange('github_url', e.target.value)}
                className="glass-card border-white/10 focus:border-primary"
              />
            </div>

            {/* LinkedIn URL */}
            <div className="space-y-2">
              <label htmlFor="linkedin_url" className="text-sm font-medium flex items-center">
                <LinkedinLogo size={16} className="mr-2" />
                LinkedIn Profile
              </label>
              <Input
                id="linkedin_url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={contactData.linkedin_url}
                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                className="glass-card border-white/10 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Social links will appear in the footer section of your portfolio
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio / Description
              </label>
              <Textarea
                id="bio"
                placeholder="Brief description about yourself..."
                value={contactData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="glass-card border-white/10 focus:border-primary resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              How your contact information will appear
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contact Items Preview */}
            <div className="space-y-3">
              {contactData.phone && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Phone size={20} className="text-primary" />
                  <div>
                    <div className="text-sm font-medium">Phone</div>
                    <div className="text-xs text-muted-foreground">{contactData.phone}</div>
                  </div>
                </div>
              )}

              {contactData.email && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <EnvelopeSimple size={20} className="text-primary" />
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <div className="text-xs text-muted-foreground">{contactData.email}</div>
                  </div>
                </div>
              )}

              {contactData.location && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <MapPin size={20} className="text-primary" />
                  <div>
                    <div className="text-sm font-medium">Location</div>
                    <div className="text-xs text-muted-foreground">{contactData.location}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Bio Preview */}
            {contactData.bio && (
              <div>
                <h4 className="text-sm font-medium mb-2">Bio</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {contactData.bio}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleContactAdmin;