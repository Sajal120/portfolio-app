import React, { useEffect, useState } from 'react';
import { 
  ChatCircle, 
  Envelope, 
  Trash,
  Eye,
  EyeSlash,
  Clock,
  User,
  Check,
  X
} from 'phosphor-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_replied: boolean;
  created_at: string;
}

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    const filterMessages = () => {
      let filtered = [...messages];

      // Filter by search term
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(message =>
          message.name.toLowerCase().includes(search) ||
          message.email.toLowerCase().includes(search) ||
          message.subject.toLowerCase().includes(search) ||
          message.message.toLowerCase().includes(search)
        );
      }

      // Filter by status
      switch (statusFilter) {
        case 'unread':
          filtered = filtered.filter(message => !message.is_read);
          break;
        case 'read':
          filtered = filtered.filter(message => message.is_read);
          break;
        case 'replied':
          filtered = filtered.filter(message => message.is_replied);
          break;
        case 'pending':
          filtered = filtered.filter(message => !message.is_replied);
          break;
      }

      setFilteredMessages(filtered);
    };

    filterMessages();
  }, [messages, searchTerm, statusFilter]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.map(message =>
        message.id === id ? { ...message, is_read: true } : message
      ));

      toast.success('Message marked as read');
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('Failed to mark message as read');
    }
  };

  const markAsReplied = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_replied: true })
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.map(message =>
        message.id === id ? { ...message, is_replied: true } : message
      ));

      toast.success('Message marked as replied');
    } catch (error) {
      console.error('Error marking message as replied:', error);
      toast.error('Failed to mark message as replied');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessages(prev => prev.filter(message => message.id !== id));
      setSelectedMessage(null);
      toast.success('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageStatusColor = (message: ContactMessage) => {
    if (message.is_replied) return 'text-green-400';
    if (message.is_read) return 'text-blue-400';
    return 'text-yellow-400';
  };

  const getMessageStatusText = (message: ContactMessage) => {
    if (message.is_replied) return 'Replied';
    if (message.is_read) return 'Read';
    return 'New';
  };

  const openEmailClient = (message: ContactMessage) => {
    const subject = `Re: ${message.subject}`;
    const body = `\n\n---\nOriginal message from ${message.name}:\n${message.message}`;
    const mailtoUrl = `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    
    // Mark as replied
    markAsReplied(message.id);
  };

  const unreadCount = messages.filter(m => !m.is_read).length;
  const repliedCount = messages.filter(m => m.is_replied).length;

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
              Messages
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage contact form submissions and inquiries
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="glass-card border-white/10">
            <ChatCircle className="mr-1" size={14} />
            {messages.length} Total
          </Badge>
          <Badge variant="outline" className="glass-card border-yellow-400/20 text-yellow-400">
            <Clock className="mr-1" size={14} />
            {unreadCount} Unread
          </Badge>
          <Badge variant="outline" className="glass-card border-green-400/20 text-green-400">
            <Check className="mr-1" size={14} />
            {repliedCount} Replied
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card border-white/10">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-card border-white/10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 glass-card border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="read">Read Only</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="pending">Pending Reply</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Envelope className="mr-2" size={20} />
                Messages ({filteredMessages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredMessages.length === 0 ? (
                <div className="p-6 text-center">
                  <ChatCircle size={48} className="mx-auto mb-4 text-white/50" />
                  <p className="text-muted-foreground">No messages found</p>
                  {searchTerm || statusFilter !== 'all' ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your filters
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      Messages from your contact form will appear here
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 cursor-pointer transition-colors border-b border-white/5 hover:bg-white/5 ${
                        selectedMessage?.id === message.id ? 'bg-white/10' : ''
                      } ${!message.is_read ? 'border-l-4 border-l-yellow-400' : ''}`}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.is_read) {
                          markAsRead(message.id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm truncate flex-1">
                          {message.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            message.is_replied ? 'border-green-400/20 text-green-400' :
                            message.is_read ? 'border-blue-400/20 text-blue-400' :
                            'border-yellow-400/20 text-yellow-400'
                          }`}
                        >
                          {getMessageStatusText(message)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1 truncate">
                        {message.subject}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle className="flex items-center">
                      <User className="mr-2" size={20} />
                      {selectedMessage.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`${
                        selectedMessage.is_replied ? 'border-green-400/20 text-green-400' :
                        selectedMessage.is_read ? 'border-blue-400/20 text-blue-400' :
                        'border-yellow-400/20 text-yellow-400'
                      }`}
                    >
                      {getMessageStatusText(selectedMessage)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {!selectedMessage.is_replied && (
                      <Button
                        onClick={() => openEmailClient(selectedMessage)}
                        className="btn-glow"
                        size="sm"
                      >
                        <Envelope size={16} className="mr-2" />
                        Reply
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="glass-card border-white/10"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{selectedMessage.email}</span>
                    <span>•</span>
                    <span>{formatDate(selectedMessage.created_at)}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Subject</h3>
                  <p className="text-muted-foreground">{selectedMessage.subject}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Message</h3>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  {!selectedMessage.is_read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(selectedMessage.id)}
                      className="glass-card border-white/10"
                    >
                      <Eye size={16} className="mr-2" />
                      Mark as Read
                    </Button>
                  )}
                  {!selectedMessage.is_replied && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsReplied(selectedMessage.id)}
                      className="glass-card border-white/10"
                    >
                      <Check size={16} className="mr-2" />
                      Mark as Replied
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border-white/10">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <ChatCircle size={64} className="mx-auto mb-4 text-white/30" />
                  <h3 className="text-lg font-medium mb-2">Select a Message</h3>
                  <p className="text-muted-foreground">
                    Choose a message from the list to view its details
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {messages.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Messages</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {unreadCount}
            </div>
            <div className="text-sm text-muted-foreground">Unread</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {repliedCount}
            </div>
            <div className="text-sm text-muted-foreground">Replied</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {messages.filter(m => {
                const today = new Date();
                const messageDate = new Date(m.created_at);
                return messageDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <div className="text-sm text-muted-foreground">Today</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMessages;