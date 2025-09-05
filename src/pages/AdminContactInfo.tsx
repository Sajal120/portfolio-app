import React, { useEffect, useState } from 'react';
import { 
  AddressBook, 
  FloppyDisk as Save, 
  Plus,
  Trash,
  Envelope,
  Phone,
  MapPin,
  Globe,
  LinkedinLogo,
  GithubLogo,
  TwitterLogo,
  InstagramLogo
} from 'phosphor-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ContactInfo {
  id: string;
  type?: string;
  label?: string;
  value?: string;
  icon?: string;
  is_public?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
  // Legacy fields that might exist
  phone?: string;
  email?: string;
  location?: string;
  github_url?: string;
  linkedin_url?: string;
  bio?: string;
}

const contactTypes = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Phone', icon: '📱' },
  { value: 'address', label: 'Address', icon: '📍' },
  { value: 'website', label: 'Website', icon: '🌐' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'github', label: 'GitHub', icon: '👨‍💻' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'discord', label: 'Discord', icon: '🎮' },
  { value: 'telegram', label: 'Telegram', icon: '✈️' },
  { value: 'other', label: 'Other', icon: '🔗' }
];

const AdminContactInfo: React.FC = () => {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newContact, setNewContact] = useState({
    type: 'email',
    label: '',
    value: '',
    is_public: true
  });

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_info')
        .select('*');

      if (error) throw error;

      // Transform the existing table structure to our expected format
      const transformedContacts: ContactInfo[] = [];
      
      if (data && data.length > 0) {
        data.forEach((item, index) => {
          const baseId = item.id || `item-${index}`;
          
          if (item.phone) {
            transformedContacts.push({
              id: `phone-${baseId}`,
              type: 'phone',
              label: 'Phone',
              value: item.phone,
              icon: '📱',
              is_public: true,
              display_order: 1,
              created_at: item.created_at,
              updated_at: item.updated_at
            });
          }
          
          if (item.email) {
            transformedContacts.push({
              id: `email-${baseId}`,
              type: 'email',
              label: 'Email',
              value: item.email,
              icon: '📧',
              is_public: true,
              display_order: 2,
              created_at: item.created_at,
              updated_at: item.updated_at
            });
          }
          
          if (item.location) {
            transformedContacts.push({
              id: `location-${baseId}`,
              type: 'address',
              label: 'Location',
              value: item.location,
              icon: '📍',
              is_public: true,
              display_order: 3,
              created_at: item.created_at,
              updated_at: item.updated_at
            });
          }
          
          if (item.github_url) {
            transformedContacts.push({
              id: `github-${baseId}`,
              type: 'github',
              label: 'GitHub',
              value: item.github_url,
              icon: '👨‍💻',
              is_public: true,
              display_order: 4,
              created_at: item.created_at,
              updated_at: item.updated_at
            });
          }
          
          if (item.linkedin_url) {
            transformedContacts.push({
              id: `linkedin-${baseId}`,
              type: 'linkedin',
              label: 'LinkedIn',
              value: item.linkedin_url,
              icon: '💼',
              is_public: true,
              display_order: 5,
              created_at: item.created_at,
              updated_at: item.updated_at
            });
          }
          
          if (item.bio) {
            transformedContacts.push({
              id: `bio-${baseId}`,
              type: 'other',
              label: 'Bio',
              value: item.bio,
              icon: '📝',
              is_public: true,
              display_order: 6,
              created_at: item.created_at,
              updated_at: item.updated_at
            });
          }
        });
      }

      setContacts(transformedContacts);
    } catch (error) {
      console.error('Error loading contact info:', error);
      toast.error('Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  const addContactInfo = async () => {
    if (!newContact.label.trim() || !newContact.value.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      // Since the current table has a different structure, let's work with it
      // Map the new contact type to the existing table structure
      interface LegacyContactInfo {
        phone: string;
        email: string;
        location: string;
        github_url: string;
        linkedin_url: string;
        bio: string;
        created_at: string;
        updated_at: string;
      }
      
      const contactToAdd: LegacyContactInfo = {
        phone: '',
        email: '',
        location: '',
        github_url: '',
        linkedin_url: '',
        bio: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      switch (newContact.type) {
        case 'phone':
          contactToAdd.phone = newContact.value;
          contactToAdd.bio = newContact.label;
          break;
        case 'email':
          contactToAdd.email = newContact.value;
          contactToAdd.bio = newContact.label;
          break;
        case 'address':
          contactToAdd.location = newContact.value;
          contactToAdd.bio = newContact.label;
          break;
        case 'github':
          contactToAdd.github_url = newContact.value;
          contactToAdd.bio = newContact.label;
          break;
        case 'linkedin':
          contactToAdd.linkedin_url = newContact.value;
          contactToAdd.bio = newContact.label;
          break;
        default:
          // For other types, use bio field
          contactToAdd.bio = `${newContact.label}: ${newContact.value}`;
      }

      const { error } = await supabase
        .from('contact_info')
        .insert([contactToAdd]);

      if (error) throw error;

      toast.success('Contact information added successfully');
      setNewContact({
        type: 'email',
        label: '',
        value: '',
        is_public: true
      });
      loadContactInfo();
    } catch (error) {
      console.error('Error adding contact info:', error);
      toast.error('Failed to add contact information');
    } finally {
      setSaving(false);
    }
  };

  const updateContactInfo = async (id: string, updates: Partial<ContactInfo>) => {
    try {
      const { error } = await supabase
        .from('contact_info')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setContacts(prev => prev.map(contact => 
        contact.id === id ? { ...contact, ...updates } : contact
      ));
      
      toast.success('Contact information updated successfully');
    } catch (error) {
      console.error('Error updating contact info:', error);
      toast.error('Failed to update contact information');
    }
  };

  const deleteContactInfo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact information?')) return;

    try {
      const { error } = await supabase
        .from('contact_info')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(prev => prev.filter(contact => contact.id !== id));
      toast.success('Contact information deleted successfully');
    } catch (error) {
      console.error('Error deleting contact info:', error);
      toast.error('Failed to delete contact information');
    }
  };

  const moveContact = async (id: string, direction: 'up' | 'down') => {
    // Temporarily disabled until database migration
    toast.error('Reordering will be available after database migration');
    return;
  };

  const getContactIcon = (type: string) => {
    const contactType = contactTypes.find(ct => ct.value === type);
    return contactType?.icon || '🔗';
  };

  const formatContactValue = (type: string, value: string) => {
    switch (type) {
      case 'email':
        return `mailto:${value}`;
      case 'phone':
        return `tel:${value}`;
      case 'website':
      case 'linkedin':
      case 'github':
      case 'twitter':
      case 'instagram':
        return value.startsWith('http') ? value : `https://${value}`;
      default:
        return value;
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
              Contact Information
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your contact details and social media links
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="glass-card border-white/10">
            <AddressBook className="mr-1" size={14} />
            {contacts.length} Contacts
          </Badge>
          <Badge variant="outline" className="glass-card border-white/10">
            <Globe className="mr-1" size={14} />
            {contacts.filter(c => c.is_public).length} Public
          </Badge>
        </div>
      </div>

      {/* Add New Contact */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2" size={20} />
            Add Contact Information
          </CardTitle>
          <CardDescription>
            Add a new way for people to contact you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select
                value={newContact.type}
                onValueChange={(value) => setNewContact(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="glass-card border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contactTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Label</label>
              <Input
                value={newContact.label}
                onChange={(e) => setNewContact(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Primary Email, Work Phone..."
                className="glass-card border-white/10"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Value</label>
              <Input
                value={newContact.value}
                onChange={(e) => setNewContact(prev => ({ ...prev, value: e.target.value }))}
                placeholder="contact@example.com, +1234567890..."
                className="glass-card border-white/10"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={addContactInfo}
                disabled={saving || !newContact.label.trim() || !newContact.value.trim()}
                className="w-full btn-glow"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Add Contact
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_public"
              checked={newContact.is_public}
              onChange={(e) => setNewContact(prev => ({ ...prev, is_public: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="is_public" className="text-sm">
              Make this contact information public on portfolio
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Contact List */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AddressBook className="mr-2" size={20} />
            Contact Details
          </CardTitle>
          <CardDescription>
            Manage and reorder your contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <AddressBook size={48} className="mx-auto mb-4 text-white/50" />
              <p className="text-muted-foreground">No contact information added yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first contact method above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <Card key={contact.id} className="glass-card border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl">
                        {contact.icon || getContactIcon(contact.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{contact.label}</span>
                          {!contact.is_public && (
                            <Badge variant="outline" className="text-xs">
                              Private
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {contact.type === 'address' ? (
                            contact.value
                          ) : (
                            <a
                              href={formatContactValue(contact.type, contact.value)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary transition-colors"
                            >
                              {contact.value}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Move Up/Down */}
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveContact(contact.id, 'up')}
                          disabled={index === 0}
                          className="glass-card border-white/10 h-6 w-6 p-0"
                        >
                          ↑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveContact(contact.id, 'down')}
                          disabled={index === contacts.length - 1}
                          className="glass-card border-white/10 h-6 w-6 p-0"
                        >
                          ↓
                        </Button>
                      </div>
                      
                      {/* Toggle Public/Private */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateContactInfo(contact.id, { is_public: !contact.is_public })}
                        className="glass-card border-white/10"
                      >
                        {contact.is_public ? '👁️' : '🔒'}
                      </Button>
                      
                      {/* Delete */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteContactInfo(contact.id)}
                        className="glass-card border-white/10"
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2" size={20} />
            Public Contact Preview
          </CardTitle>
          <CardDescription>
            How your contact information will appear on your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-white/5 rounded-xl">
            {contacts.filter(c => c.is_public).length === 0 ? (
              <p className="text-center text-muted-foreground">
                No public contact information to display
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {contacts
                  .filter(contact => contact.is_public)
                  .map((contact) => (
                    <div key={contact.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <span className="text-lg">
                        {contact.icon || getContactIcon(contact.type)}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{contact.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {contact.value}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContactInfo;