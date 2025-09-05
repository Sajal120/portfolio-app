import React, { useState, useEffect } from 'react';
import { FloppyDisk, Eye, Globe } from 'phosphor-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import toast from 'react-hot-toast';

interface FooterContent {
  brand_name: string;
  description: string;
  copyright_text: string;
  location: string;
  phone: string;
  email: string;
}

const AdminFooter: React.FC = () => {
  const [footerData, setFooterData] = useState<FooterContent>({
    brand_name: 'Sajal Basnet',
    description: 'IT professional specializing in support, security, and development. Dedicated to protecting systems, solving complex problems, and building secure digital solutions. Ready to strengthen your technology infrastructure.',
    copyright_text: '© 2025 Sajal Basnet. All rights reserved.',
    location: 'Auburn, Sydney, NSW',
    phone: '+61 424 425 793',
    email: 'basnetsajal120@gmail.com'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFooterContent();
  }, []);

  const loadFooterContent = () => {
    try {
      setLoading(true);
      const savedContent = localStorage.getItem('footer_content');
      if (savedContent) {
        const parsedContent = JSON.parse(savedContent);
        setFooterData(prev => ({
          ...prev,
          ...parsedContent
        }));
      }
    } catch (error) {
      console.error('Error loading footer content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FooterContent, value: string) => {
    setFooterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving footer data:', footerData);
      
      // Save to localStorage for now
      localStorage.setItem('footer_content', JSON.stringify(footerData));
      
      toast.success('Footer content saved successfully');
    } catch (error) {
      console.error('Error saving footer content:', error);
      toast.error('Failed to save footer content');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  if (loading && !footerData.brand_name) {
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
              Footer Settings
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize your website footer content and contact information
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
            <CardTitle>Footer Content</CardTitle>
            <CardDescription>
              Edit the footer information displayed on your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Brand Name */}
            <div className="space-y-2">
              <label htmlFor="brand_name" className="text-sm font-medium">
                Brand Name
              </label>
              <Input
                id="brand_name"
                placeholder="Your Name or Brand"
                value={footerData.brand_name}
                onChange={(e) => handleInputChange('brand_name', e.target.value)}
                className="glass-card border-white/10 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                The main brand name displayed in the footer
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Brief description about yourself or your services..."
                value={footerData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="glass-card border-white/10 focus:border-primary resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Brief description about your professional services
              </p>
            </div>

            {/* Copyright Text */}
            <div className="space-y-2">
              <label htmlFor="copyright_text" className="text-sm font-medium">
                Copyright Text
              </label>
              <Input
                id="copyright_text"
                placeholder="© 2025 Your Name. All rights reserved."
                value={footerData.copyright_text}
                onChange={(e) => handleInputChange('copyright_text', e.target.value)}
                className="glass-card border-white/10 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Copyright notice displayed at the bottom
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Location
                </label>
                <Input
                  id="location"
                  placeholder="City, State, Country"
                  value={footerData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="glass-card border-white/10 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  placeholder="+1 234 567 8900"
                  value={footerData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="glass-card border-white/10 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  placeholder="contact@example.com"
                  value={footerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="glass-card border-white/10 focus:border-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your footer will look to visitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-t from-background via-background/50 to-transparent p-8 rounded-xl border border-white/10">
              {/* Main Footer Content */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Brand */}
                <div className="md:col-span-2">
                  <div className="text-2xl font-bold mb-3">
                    <span className="bg-gradient-primary bg-clip-text text-transparent">
                      {footerData.brand_name || 'Brand Name'}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {footerData.description || 'Your description will appear here...'}
                  </p>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Get In Touch</h4>
                  <div className="space-y-1 text-muted-foreground text-xs">
                    <p>{footerData.location || 'Location'}</p>
                    <p>{footerData.phone || 'Phone'}</p>
                    <p>{footerData.email || 'Email'}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-white/10 pt-4">
                <div className="text-muted-foreground text-xs text-center">
                  {footerData.copyright_text || 'Copyright text'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note about Social Links */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2" size={20} />
            Social Media Links
          </CardTitle>
          <CardDescription>
            Social media links in the footer are managed through the Contact Information section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            To add or modify social media links in the footer, please go to the{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary" 
              onClick={() => window.location.href = '/admin/contact'}
            >
              Contact Information
            </Button>{' '}
            page and add entries with types like GitHub, LinkedIn, Twitter, etc.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFooter;