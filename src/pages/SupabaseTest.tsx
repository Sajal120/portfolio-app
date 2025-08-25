import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const SupabaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Basic connection
      addResult('Testing Supabase connection...');
      const { data, error } = await supabase.from('hero_content').select('count').limit(1);
      if (error) {
        addResult(`❌ Connection failed: ${error.message}`);
        return;
      }
      addResult('✅ Supabase connection working');

      // Test 2: Check if profiles table exists
      addResult('Testing profiles table...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        addResult(`❌ Profiles table error: ${profilesError.message}`);
      } else {
        addResult(`✅ Profiles table accessible (${profilesData?.length || 0} records found)`);
      }

      // Test 3: Check current auth state
      addResult('Checking auth state...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        addResult(`❌ Auth error: ${userError.message}`);
      } else if (user) {
        addResult(`✅ User logged in: ${user.email}`);
        
        // Test 4: Check if user has profile
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          addResult(`❌ User profile error: ${profileError.message}`);
          if (profileError.code === 'PGRST116') {
            addResult('❌ No profile found for this user - this is likely the issue!');
          }
        } else {
          addResult(`✅ User profile found: Admin=${userProfile.is_admin}`);
        }
      } else {
        addResult('ℹ️ No user currently logged in');
      }

      // Test 5: Try to sign in with test credentials
      addResult('Testing sign in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'basnetsajal120@gmail.com',
        password: '192J120SDo'
      });

      if (signInError) {
        addResult(`❌ Sign in failed: ${signInError.message}`);
      } else {
        addResult(`✅ Sign in successful: ${signInData.user?.email}`);
        
        // Check profile again after sign in
        const { data: newProfile, error: newProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signInData.user!.id)
          .single();
        
        if (newProfileError) {
          addResult(`❌ Profile check after login failed: ${newProfileError.message}`);
        } else {
          addResult(`✅ Profile after login: Admin=${newProfile.is_admin}`);
        }
      }

    } catch (error) {
      addResult(`❌ Unexpected error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createProfileForUser = async () => {
    try {
      addResult('Creating profile for current user...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        addResult('❌ No user logged in');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          is_admin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        addResult(`❌ Failed to create profile: ${error.message}`);
      } else {
        addResult('✅ Profile created successfully');
      }
    } catch (error) {
      addResult(`❌ Error creating profile: ${error}`);
    }
  };

  const createUserAccount = async () => {
    try {
      addResult('Creating user account...');
      
      const { data, error } = await supabase.auth.signUp({
        email: 'basnetsajal120@gmail.com',
        password: '192J120SDo',
        options: {
          data: {
            full_name: 'Sajal Basnet'
          }
        }
      });

      if (error) {
        addResult(`❌ Failed to create user: ${error.message}`);
      } else if (data.user) {
        addResult(`✅ User created successfully: ${data.user.email}`);
        addResult('ℹ️ Check your email for confirmation (if required)');
        
        // Auto-create profile
        setTimeout(async () => {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user!.id,
              email: data.user!.email!,
              full_name: 'Sajal Basnet',
              is_admin: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (profileError) {
            addResult(`❌ Failed to create profile: ${profileError.message}`);
          } else {
            addResult('✅ Admin profile created automatically');
          }
        }, 1000);
      }
    } catch (error) {
      addResult(`❌ Error creating user: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card border-white/10 p-6 rounded-xl">
          <h1 className="text-2xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Supabase Connection Test
            </span>
          </h1>
          
          <div className="space-y-4 mb-6">
            <button
              onClick={testConnection}
              disabled={loading}
              className="btn-glow px-6 py-3 rounded-xl mr-4"
            >
              {loading ? 'Testing...' : 'Run Connection Test'}
            </button>
            
            <button
              onClick={createUserAccount}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors mr-4"
            >
              Create User Account
            </button>
            
            <button
              onClick={createProfileForUser}
              className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              Create Admin Profile
            </button>
          </div>

          <div className="bg-black/50 rounded-xl p-4 font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">Click "Run Connection Test" to start debugging...</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest;