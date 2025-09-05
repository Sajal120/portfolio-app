import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const DatabaseTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const testDatabase = async () => {
    setTesting(true);
    const testResults: string[] = [];

    try {
      // Test 1: Check if loading_content table exists
      testResults.push('🔍 Testing loading_content table...');
      
      const { data, error } = await supabase
        .from('loading_content')
        .select('*')
        .limit(1);

      if (error) {
        testResults.push(`❌ Table error: ${error.message}`);
        if (error.message.includes('relation "loading_content" does not exist')) {
          testResults.push('📋 SOLUTION: Run the SQL migration in Supabase dashboard');
          testResults.push('📁 SQL file: create-loading-content-table.sql');
        }
      } else {
        testResults.push('✅ loading_content table exists');
        testResults.push(`📊 Found ${data?.length || 0} records`);
      }

      // Test 2: Check authentication
      testResults.push('\n🔍 Testing authentication...');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        testResults.push(`❌ Auth error: ${userError.message}`);
      } else {
        testResults.push(`✅ User: ${userData.user?.email || 'Unknown'}`);
      }

      // Test 3: Try to insert test data
      if (!error) {
        testResults.push('\n🔍 Testing insert permissions...');
        const { error: insertError } = await supabase
          .from('loading_content')
          .insert([{
            name: 'Test',
            subtitle: 'Test Subtitle',
            status_messages: ['Test message'],
            is_active: false
          }]);

        if (insertError) {
          testResults.push(`❌ Insert error: ${insertError.message}`);
        } else {
          testResults.push('✅ Insert permissions OK');
          
          // Clean up test data
          await supabase
            .from('loading_content')
            .delete()
            .eq('name', 'Test')
            .eq('is_active', false);
        }
      }

    } catch (error) {
      testResults.push(`❌ Unexpected error: ${error}`);
    }

    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle>Database Test - Loading Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testDatabase}
              disabled={testing}
              className="btn-glow"
            >
              {testing ? 'Testing...' : 'Run Database Test'}
            </Button>

            {results.length > 0 && (
              <div className="bg-black/20 p-4 rounded-xl font-mono text-sm space-y-1">
                {results.map((result, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {result}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <h3 className="font-medium text-yellow-400 mb-2">Setup Instructions:</h3>
              <ol className="text-sm space-y-2 text-yellow-200">
                <li>1. Go to your Supabase Dashboard</li>
                <li>2. Navigate to SQL Editor</li>
                <li>3. Copy the content from <code>create-loading-content-table.sql</code></li>
                <li>4. Run the SQL query</li>
                <li>5. Come back and test again</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/admin'}
                className="glass-card border-white/10"
              >
                Back to Admin
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/admin/loading'}
                className="glass-card border-white/10"
              >
                Try Loading Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseTest;