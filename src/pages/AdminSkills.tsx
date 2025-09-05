import React, { useEffect, useState } from 'react';
import { 
  Code, 
  FloppyDisk as Save, 
  Plus,
  Trash,
  Lightning,
  Star,
  TrendUp
} from 'phosphor-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

const skillCategories = [
  'AI Tools',
  'Development', 
  'Security',
  'Cloud',
  'Database',
  'Mobile',
  'Design',
  'Tools',
  'Other'
];

const skillIcons = [
  { name: 'React', icon: '⚛️' },
  { name: 'Vue', icon: '💚' },
  { name: 'Angular', icon: '🅰️' },
  { name: 'JavaScript', icon: '📜' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Python', icon: '🐍' },
  { name: 'Node.js', icon: '💚' },
  { name: 'Express', icon: '🚂' },
  { name: 'MongoDB', icon: '🍃' },
  { name: 'PostgreSQL', icon: '🐘' },
  { name: 'MySQL', icon: '🐬' },
  { name: 'Redis', icon: '🔴' },
  { name: 'Docker', icon: '🐳' },
  { name: 'AWS', icon: '☁️' },
  { name: 'Git', icon: '🌳' },
  { name: 'Figma', icon: '🎨' },
  { name: 'Photoshop', icon: '🖼️' },
  { name: 'Tailwind', icon: '💨' },
  { name: 'Bootstrap', icon: '🅱️' },
  { name: 'Sass', icon: '💅' }
];

const AdminSkills: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 50,
    category: 'Development',
    icon: ''
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })
        .order('level', { ascending: false });

      if (error) throw error;

      setSkills(data || []);
    } catch (error) {
      console.error('Error loading skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async () => {
    if (!newSkill.name.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    try {
      setSaving(true);
      
      // Find matching icon
      const matchingIcon = skillIcons.find(
        icon => icon.name.toLowerCase() === newSkill.name.toLowerCase()
      );

      const skillToAdd = {
        ...newSkill,
        icon: matchingIcon?.icon || newSkill.icon || '⚡',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('skills')
        .insert([skillToAdd]);

      if (error) throw error;

      toast.success('Skill added successfully');
      setNewSkill({
        name: '',
        level: 50,
        category: 'Frontend',
        icon: ''
      });
      loadSkills();
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error('Failed to add skill');
    } finally {
      setSaving(false);
    }
  };

  const updateSkill = async (id: string, updates: Partial<Skill>) => {
    try {
      const { error } = await supabase
        .from('skills')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setSkills(prev => prev.map(skill => 
        skill.id === id ? { ...skill, ...updates } : skill
      ));
      
      toast.success('Skill updated successfully');
    } catch (error) {
      console.error('Error updating skill:', error);
      toast.error('Failed to update skill');
    }
  };

  const startEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
  };

  const cancelEditSkill = () => {
    setEditingSkill(null);
  };

  const saveEditSkill = async () => {
    if (!editingSkill) return;
    
    try {
      setSaving(true);
      await updateSkill(editingSkill.id, {
        name: editingSkill.name,
        category: editingSkill.category,
        level: editingSkill.level
      });
      setEditingSkill(null);
      toast.success('Skill updated successfully');
    } catch (error) {
      console.error('Error updating skill:', error);
      toast.error('Failed to update skill');
    } finally {
      setSaving(false);
    }
  };

  const deleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSkills(prev => prev.filter(skill => skill.id !== id));
      toast.success('Skill deleted successfully');
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error('Failed to delete skill');
    }
  };

  const getSkillLevelColor = (level: number) => {
    if (level >= 80) return 'text-green-400';
    if (level >= 60) return 'text-blue-400';
    if (level >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSkillLevelText = (level: number) => {
    if (level >= 80) return 'Expert';
    if (level >= 60) return 'Advanced';
    if (level >= 40) return 'Intermediate';
    return 'Beginner';
  };

  const groupedSkills = skills.reduce((groups, skill) => {
    const category = skill.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(skill);
    return groups;
  }, {} as Record<string, Skill[]>);

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
              Skills Management
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your technical skills and expertise levels
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="glass-card border-white/10">
            <Lightning className="mr-1" size={14} />
            {skills.length} Skills
          </Badge>
        </div>
      </div>

      {/* Add New Skill */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2" size={20} />
            Add New Skill
          </CardTitle>
          <CardDescription>
            Add a new skill to your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Skill Name</label>
              <Input
                value={newSkill.name}
                onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                placeholder="React, Python, AWS..."
                className="glass-card border-white/10"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={newSkill.category}
                onValueChange={(value) => setNewSkill(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="glass-card border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Level ({newSkill.level}%)</label>
              <Input
                type="range"
                min="0"
                max="100"
                value={newSkill.level}
                onChange={(e) => setNewSkill(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                className="glass-card border-white/10"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={addSkill}
                disabled={saving || !newSkill.name.trim()}
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
                    Add Skill
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills by Category */}
      <div className="space-y-6">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <Card key={category} className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Code className="mr-2" size={20} />
                  {category}
                </div>
                <Badge variant="outline" className="glass-card border-white/10">
                  {categorySkills.length} skills
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySkills.map((skill) => (
                  <Card key={skill.id} className="glass-card border-white/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{skill.icon}</span>
                        <span className="font-medium">{skill.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditSkill(skill)}
                          className="glass-card border-white/10 h-8 w-8 p-0"
                        >
                          <Code size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSkill(skill.id)}
                          className="glass-card border-white/10 h-8 w-8 p-0"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className={getSkillLevelColor(skill.level)}>
                          {getSkillLevelText(skill.level)}
                        </span>
                        <span className="text-muted-foreground">{skill.level}%</span>
                      </div>
                      
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            skill.level >= 80 ? 'bg-green-400' :
                            skill.level >= 60 ? 'bg-blue-400' :
                            skill.level >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Input
                          type="range"
                          min="0"
                          max="100"
                          value={skill.level}
                          onChange={(e) => {
                            const newLevel = parseInt(e.target.value);
                            updateSkill(skill.id, { level: newLevel });
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skills Summary */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendUp className="mr-2" size={20} />
            Skills Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {skills.filter(s => s.level >= 80).length}
              </div>
              <div className="text-sm text-muted-foreground">Expert Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {skills.filter(s => s.level >= 60 && s.level < 80).length}
              </div>
              <div className="text-sm text-muted-foreground">Advanced Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {skills.filter(s => s.level >= 40 && s.level < 60).length}
              </div>
              <div className="text-sm text-muted-foreground">Intermediate Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">
                {skills.filter(s => s.level < 40).length}
              </div>
              <div className="text-sm text-muted-foreground">Beginner Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Skill Modal */}
      {editingSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="glass-card border-white/10 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Edit Skill</CardTitle>
              <CardDescription>
                Update skill information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Skill Name</label>
                <Input
                  placeholder="Enter skill name"
                  value={editingSkill.name}
                  onChange={(e) => setEditingSkill(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="glass-card border-white/10"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={editingSkill.category}
                  onValueChange={(value) => setEditingSkill(prev => prev ? { ...prev, category: value } : null)}
                >
                  <SelectTrigger className="glass-card border-white/10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Level ({editingSkill.level}%)</label>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={editingSkill.level}
                  onChange={(e) => setEditingSkill(prev => prev ? { ...prev, level: parseInt(e.target.value) } : null)}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={saveEditSkill}
                  disabled={saving || !editingSkill.name.trim()}
                  className="btn-glow flex-1"
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
                <Button
                  variant="outline"
                  onClick={cancelEditSkill}
                  className="glass-card border-white/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminSkills;