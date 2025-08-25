import React, { useEffect, useState } from 'react';
import { 
  Image as ImageIcon, 
  FloppyDisk as Save, 
  Plus,
  Trash,
  Upload,
  Eye,
  Download,
  Copy,
  Folder,
  File,
  MagnifyingGlass as Search
} from 'phosphor-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface MediaFile {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: Record<string, unknown>;
}

const AdminMedia: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState('');

  const loadFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from('images')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    const filterFiles = () => {
      let filtered = [...files];

      // Filter by search term
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(file =>
          file.name.toLowerCase().includes(search)
        );
      }

      // Filter by file type
      if (filterType !== 'all') {
        filtered = filtered.filter(file => {
          const mimetype = (file.metadata?.mimetype as string) || '';
          switch (filterType) {
            case 'images':
              return mimetype.startsWith('image/');
            case 'documents':
              return mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('text');
            case 'videos':
              return mimetype.startsWith('video/');
            default:
              return true;
          }
        });
      }

      setFilteredFiles(filtered);
    };

    filterFiles();
  }, [files, searchTerm, filterType]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = event.target.files;
    if (!uploadFiles || uploadFiles.length === 0) return;

    setUploading(true);
    const uploadPromises = [];

    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = currentFolder ? `${currentFolder}/${fileName}` : fileName;

      uploadPromises.push(
        supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })
      );
    }

    try {
      const results = await Promise.all(uploadPromises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        toast.error(`Failed to upload ${errors.length} file(s)`);
      } else {
        toast.success(`Successfully uploaded ${uploadFiles.length} file(s)`);
      }
      
      loadFiles(); // Reload files list
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  const deleteFile = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase.storage
        .from('images')
        .remove([fileName]);

      if (error) throw error;

      setFiles(prev => prev.filter(file => file.name !== fileName));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const deleteMultipleFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedFiles.length} selected file(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase.storage
        .from('images')
        .remove(selectedFiles);

      if (error) throw error;

      setFiles(prev => prev.filter(file => !selectedFiles.includes(file.name)));
      setSelectedFiles([]);
      toast.success(`Successfully deleted ${selectedFiles.length} file(s)`);
    } catch (error) {
      console.error('Error deleting files:', error);
      toast.error('Failed to delete selected files');
    }
  };

  const copyFileUrl = async (fileName: string) => {
    try {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      await navigator.clipboard.writeText(data.publicUrl);
      toast.success('File URL copied to clipboard');
    } catch (error) {
      console.error('Error copying URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  const downloadFile = async (fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('images')
        .download(fileName);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const getFileUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('document')) return '📝';
    return '📁';
  };

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileName) 
        ? prev.filter(f => f !== fileName)
        : [...prev, fileName]
    );
  };

  const selectAllFiles = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.name));
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
              Media Library
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your portfolio images and files
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="glass-card border-white/10">
            <ImageIcon className="mr-1" size={14} />
            {files.length} Files
          </Badge>
          {selectedFiles.length > 0 && (
            <Badge variant="outline" className="glass-card border-orange-400/20 text-orange-400">
              <Eye className="mr-1" size={14} />
              {selectedFiles.length} Selected
            </Badge>
          )}
        </div>
      </div>

      {/* Upload and Filters */}
      <Card className="glass-card border-white/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Upload */}
            <div className="relative">
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <Button
                disabled={uploading}
                className="btn-glow"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Upload Files
                  </>
                )}
              </Button>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-card border-white/10 pl-10"
              />
            </div>

            {/* Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48 glass-card border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                <SelectItem value="images">Images Only</SelectItem>
                <SelectItem value="videos">Videos Only</SelectItem>
                <SelectItem value="documents">Documents</SelectItem>
              </SelectContent>
            </Select>

            {/* Bulk Actions */}
            {selectedFiles.length > 0 && (
              <Button
                variant="outline"
                onClick={deleteMultipleFiles}
                className="glass-card border-red-400/20 text-red-400 hover:bg-red-400/10"
              >
                <Trash size={16} className="mr-2" />
                Delete ({selectedFiles.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Folder className="mr-2" size={20} />
              Files ({filteredFiles.length})
            </CardTitle>
            {filteredFiles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllFiles}
                className="glass-card border-white/10"
              >
                {selectedFiles.length === filteredFiles.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon size={64} className="mx-auto mb-4 text-white/30" />
              <h3 className="text-lg font-medium mb-2">No files found</h3>
              {searchTerm || filterType !== 'all' ? (
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Upload your first file to get started
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredFiles.map((file) => {
                const isSelected = selectedFiles.includes(file.name);
                const isImage = ((file.metadata?.mimetype as string) || '').startsWith('image/');
                
                return (
                  <Card
                    key={file.name}
                    className={`glass-card transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => toggleFileSelection(file.name)}
                  >
                    <CardContent className="p-4">
                      {/* File Preview */}
                      <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                        {isImage ? (
                          <img
                            src={getFileUrl(file.name)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-3xl">
                            {getFileIcon((file.metadata?.mimetype as string) || '')}
                          </span>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-xs truncate" title={file.name}>
                          {file.name}
                        </h4>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize((file.metadata?.size as number) || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(file.created_at || '')}
                        </div>
                      </div>

                      {/* File Actions */}
                      <div className="flex gap-1 mt-3" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyFileUrl(file.name)}
                          className="flex-1 glass-card border-white/10 h-8 text-xs"
                        >
                          <Copy size={12} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(file.name)}
                          className="flex-1 glass-card border-white/10 h-8 text-xs"
                        >
                          <Download size={12} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteFile(file.name)}
                          className="flex-1 glass-card border-red-400/20 text-red-400 h-8 text-xs"
                        >
                          <Trash size={12} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Info */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {files.filter(f => ((f.metadata?.mimetype as string) || '').startsWith('image/')).length}
            </div>
            <div className="text-sm text-muted-foreground">Images</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-secondary mb-2">
              {files.filter(f => ((f.metadata?.mimetype as string) || '').startsWith('video/')).length}
            </div>
            <div className="text-sm text-muted-foreground">Videos</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-accent mb-2">
              {files.filter(f => {
                const mimetype = (f.metadata?.mimetype as string) || '';
                return mimetype.includes('pdf') || mimetype.includes('document');
              }).length}
            </div>
            <div className="text-sm text-muted-foreground">Documents</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">
              {formatFileSize(
                files.reduce((total, file) => total + ((file.metadata?.size as number) || 0), 0)
              )}
            </div>
            <div className="text-sm text-muted-foreground">Total Size</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMedia;