import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash, Eye, Upload } from 'phosphor-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { supabase, Project } from '../lib/supabase';
import toast from 'react-hot-toast';

const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingProject({
      title: '',
      description: '',
      project_type: 'Web Application',
      technologies: [],
      github_url: '',
      live_url: '',
      is_featured: true,
      is_active: true,
      sort_order: projects.length + 1
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingProject?.title || !editingProject?.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      const saveData = {
        title: editingProject.title,
        description: editingProject.description,
        project_type: editingProject.project_type || 'Web Application',
        technologies: editingProject.technologies || [],
        github_url: editingProject.github_url || null,
        live_url: editingProject.live_url || null,
        image_url: editingProject.image_url || null,
        is_featured: editingProject.is_featured ?? true,
        is_active: editingProject.is_active ?? true,
        sort_order: editingProject.sort_order || projects.length + 1,
        updated_at: new Date().toISOString()
      };

      if (editingProject.id) {
        // Update existing
        const { error } = await supabase
          .from('projects')
          .update(saveData)
          .eq('id', editingProject.id);

        if (error) throw error;
        toast.success('Project updated successfully');
      } else {
        // Insert new
        const { error } = await supabase
          .from('projects')
          .insert([saveData]);

        if (error) throw error;
        toast.success('Project created successfully');
      }

      setIsDialogOpen(false);
      setEditingProject(null);
      loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      toast.success('Project deleted successfully');
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingProject) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `project-${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

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

      setEditingProject(prev => ({
        ...prev!,
        image_url: publicUrlData.publicUrl
      }));
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const addTechnology = (tech: string) => {
    if (!tech.trim() || !editingProject) return;
    
    const currentTech = editingProject.technologies || [];
    if (!currentTech.includes(tech.trim())) {
      setEditingProject(prev => ({
        ...prev!,
        technologies: [...currentTech, tech.trim()]
      }));
    }
  };

  const removeTechnology = (tech: string) => {
    if (!editingProject) return;
    
    setEditingProject(prev => ({
      ...prev!,
      technologies: (prev!.technologies || []).filter(t => t !== tech)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded-xl w-64 mb-2" />
          <div className="h-4 bg-white/5 rounded-xl w-96" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-white/5 rounded-xl animate-pulse" />
          ))}
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
              Projects Management
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your portfolio projects and showcase your work
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => window.open('/', '_blank')}
            className="glass-card border-white/10"
          >
            <Eye size={20} className="mr-2" />
            Preview
          </Button>
          <Button onClick={handleNew} className="btn-glow">
            <Plus size={20} className="mr-2" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="glass-card border-white/10 hover:bg-white/5 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {project.project_type}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(project)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Project Image */}
              {project.image_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted/20">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-3">
                {project.description}
              </p>
              
              {/* Technologies */}
              <div className="flex flex-wrap gap-1">
                {project.technologies?.slice(0, 3).map((tech, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {(project.technologies?.length || 0) > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{(project.technologies?.length || 0) - 3} more
                  </Badge>
                )}
              </div>
              
              {/* Status */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${project.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className={project.is_active ? 'text-green-500' : 'text-gray-500'}>
                    {project.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {project.is_featured && (
                  <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">
                    Featured
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">
            Add your first project to showcase your work
          </p>
          <Button onClick={handleNew} className="btn-glow">
            <Plus size={20} className="mr-2" />
            Add Your First Project
          </Button>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-card border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject?.id ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>
            <DialogDescription>
              {editingProject?.id ? 'Update project details' : 'Add a new project to your portfolio'}
            </DialogDescription>
          </DialogHeader>
          
          {editingProject && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Title *</label>
                  <Input
                    placeholder="Amazing Project"
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject(prev => ({ ...prev!, title: e.target.value }))}
                    className="glass-card border-white/10"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Type</label>
                  <Input
                    placeholder="Web Application"
                    value={editingProject.project_type || ''}
                    onChange={(e) => setEditingProject(prev => ({ ...prev!, project_type: e.target.value }))}
                    className="glass-card border-white/10"
                  />
                </div>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="Describe your project..."
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject(prev => ({ ...prev!, description: e.target.value }))}
                  rows={4}
                  className="glass-card border-white/10 resize-none"
                />
              </div>
              
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Image</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    id="project-image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="project-image"
                    className="cursor-pointer flex items-center space-x-2 px-4 py-2 glass-card border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Upload size={16} />
                    <span className="text-sm">Upload Image</span>
                  </label>
                  {editingProject.image_url && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/20">
                      <img
                        src={editingProject.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Technologies */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Technologies</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editingProject.technologies?.map((tech, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive/20"
                      onClick={() => removeTechnology(tech)}
                    >
                      {tech} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add technology (press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addTechnology(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="glass-card border-white/10"
                />
                <p className="text-xs text-muted-foreground">
                  Type a technology name and press Enter to add it. Click on tags to remove them.
                </p>
              </div>
              
              {/* Links */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">GitHub URL</label>
                  <Input
                    placeholder="https://github.com/username/repo"
                    value={editingProject.github_url || ''}
                    onChange={(e) => setEditingProject(prev => ({ ...prev!, github_url: e.target.value }))}
                    className="glass-card border-white/10"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Live Demo URL</label>
                  <Input
                    placeholder="https://yourproject.com"
                    value={editingProject.live_url || ''}
                    onChange={(e) => setEditingProject(prev => ({ ...prev!, live_url: e.target.value }))}
                    className="glass-card border-white/10"
                  />
                </div>
              </div>
              
              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-featured"
                    checked={editingProject.is_featured ?? true}
                    onChange={(e) => setEditingProject(prev => ({ ...prev!, is_featured: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="is-featured" className="text-sm font-medium">
                    Featured Project
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-active"
                    checked={editingProject.is_active ?? true}
                    onChange={(e) => setEditingProject(prev => ({ ...prev!, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="is-active" className="text-sm font-medium">
                    Active
                  </label>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="glass-card border-white/10"
                >
                  Cancel
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
                    'Save Project'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjects;