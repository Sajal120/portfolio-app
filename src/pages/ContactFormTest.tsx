import React, { useState, useEffect } from 'react';
import { supabase, ContactMessage } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import toast from 'react-hot-toast';

const ContactFormTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    checkTableStructure();
    loadMessages();
  }, []);

  const checkTableStructure = async () => {
    try {
      // Try to query the table to see if it exists
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Table check error:', error);
        setTableExists(false);
      } else {
        setTableExists(true);
      }
    } catch (err) {
      console.error('Exception checking table:', err);
      setTableExists(false);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading messages:', error);
      } else {
        setMessages(data || []);
      }
    } catch (err) {
      console.error('Exception loading messages:', err);
    }
  };

  const testContactFormSubmission = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
          name: 'Test User',
          email: 'test@example.com',
          message: 'This is a test message from the contact form test page.'
        }])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        toast.error(`Failed to insert: ${error.message}`);
      } else {
        console.log('Success:', data);
        toast.success('Test message inserted successfully!');
        loadMessages(); // Refresh the list
      }
    } catch (err) {
      console.error('Exception during insert:', err);
      toast.error('Exception occurred during test');
    } finally {
      setLoading(false);
    }
  };

  const createTable = async () => {
    setLoading(true);
    try {
      // This is just a test - in reality we'd need proper admin privileges
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS contact_messages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      const { error } = await supabase.rpc('execute_sql', { sql: createTableSQL });
      
      if (error) {
        console.error('Create table error:', error);
        toast.error(`Failed to create table: ${error.message}`);
      } else {
        toast.success('Table created successfully!');
        checkTableStructure();
      }
    } catch (err) {
      console.error('Exception creating table:', err);
      toast.error('Exception occurred while creating table');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#162238] to-[#1F2937] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>Contact Form Database Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Table Status</h3>
                <div className={`p-3 rounded-lg ${
                  tableExists === null ? 'bg-yellow-500/20 text-yellow-400' :
                  tableExists ? 'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {tableExists === null ? 'Checking...' :
                   tableExists ? 'Table exists and accessible' :
                   'Table does not exist or is not accessible'}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Actions</h3>
                <div className="space-y-2">
                  <Button 
                    onClick={testContactFormSubmission}
                    disabled={loading || !tableExists}
                    className="w-full"
                  >
                    {loading ? 'Testing...' : 'Test Message Insert'}
                  </Button>
                  {!tableExists && (
                    <Button 
                      onClick={createTable}
                      disabled={loading}
                      variant="outline"
                      className="w-full"
                    >
                      Try Create Table
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Recent Messages ({messages.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="p-4 bg-white/5 rounded-lg text-center text-muted-foreground">
                    No messages found
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={message.id || index} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{message.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">{message.email}</div>
                      <div className="text-sm">{message.message}</div>
                      <div className="text-xs mt-2">
                        <span className={`px-2 py-1 rounded ${
                          message.is_read ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {message.is_read ? 'Read' : 'Unread'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="mr-2"
              >
                Back to Home
              </Button>
              <Button 
                onClick={() => window.location.href = '/admin/messages'}
                variant="outline"
              >
                Admin Messages
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactFormTest;