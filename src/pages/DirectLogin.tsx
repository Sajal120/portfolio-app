import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const DirectLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const navigate = useNavigate();

  const testDirectLogin = async () => {
    setLoading(true);
    setResult({ status: 'starting', message: 'Initializing test...' });
    
    try {
      console.log('Starting direct login test...');
      setResult({ status: 'testing', message: 'Testing Supabase connection...' });
      
      // Test 1: Basic connection
      console.log('1. Testing basic connection...');
      const connTest = await supabase.from('profiles').select('count').limit(1);
      console.log('Connection test result:', connTest);
      
      if (connTest.error) {
        setResult({
          success: false,
          step: 'connection',
          error: connTest.error.message,
          details: connTest.error
        });
        return;
      }
      
      setResult({ status: 'testing', message: 'Connection OK. Attempting login...' });

      // Test 2: Try direct signIn with detailed logging
      console.log('2. Attempting sign in...');
      const loginResult = await supabase.auth.signInWithPassword({
        email: 'basnetsajal120@gmail.com',
        password: '192J120SDo'
      });
      
      console.log('Sign in result:', loginResult);
      
      if (loginResult.error) {
        setResult({
          success: false,
          step: 'login',
          error: loginResult.error.message,
          errorCode: loginResult.error.status,
          details: loginResult.error
        });
        return;
      }
      
      if (loginResult.data.user) {
        setResult({ status: 'testing', message: 'Login successful! Checking admin status...' });
        console.log('3. Login successful, checking admin status...');
        
        // Check admin status
        const profileResult = await supabase
          .from('profiles')
          .select('*')
          .eq('id', loginResult.data.user.id)
          .single();
        
        console.log('Profile check:', profileResult);
        
        setResult({
          success: true,
          user: {
            id: loginResult.data.user.id,
            email: loginResult.data.user.email,
            confirmed_at: loginResult.data.user.email_confirmed_at
          },
          profile: profileResult.data,
          profileError: profileResult.error,
          session: !!loginResult.data.session
        });
        
        // If successful, redirect to admin
        if (profileResult.data?.is_admin) {
          setTimeout(() => navigate('/admin'), 3000);
        }
      } else {
        setResult({
          success: false,
          step: 'user_data',
          error: 'No user data returned from login'
        });
      }
      
    } catch (err: unknown) {
      console.error('Direct login error:', err);
      setResult({
        success: false,
        step: 'exception',
        error: (err as Error)?.message || 'Unknown error',
        stack: (err as Error)?.stack
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Direct Login Test</h1>
      
      <button
        onClick={testDirectLogin}
        disabled={loading}
        className="bg-blue-600 px-6 py-3 rounded text-white font-medium disabled:opacity-50"
      >
        {loading ? 'Testing Login...' : 'Test Direct Login'}
      </button>
      
      {result && (
        <div className="mt-6 bg-gray-900 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6">
        <p className="text-gray-400">
          Email: basnetsajal120@gmail.com<br/>
          Password: 192J120SDo
        </p>
      </div>
      
      <div className="mt-4">
        <button
          onClick={() => navigate('/admin/login')}
          className="bg-purple-600 px-4 py-2 rounded text-white"
        >
          Back to Admin Login
        </button>
      </div>
    </div>
  );
};

export default DirectLogin;