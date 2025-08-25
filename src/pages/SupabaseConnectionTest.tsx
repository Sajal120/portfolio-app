import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SupabaseConnectionTest: React.FC = () => {
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  const runFullTest = async () => {
    setLoading(true);
    const testResults: Record<string, unknown> = {};

    try {
      // Test 1: Environment variables
      testResults.environment = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'MISSING',
        supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'MISSING',
        keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
      };

      // Test 2: Supabase client initialization
      try {
        testResults.clientInit = {
          success: !!supabase,
          hasAuth: !!supabase.auth,
          hasFrom: !!supabase.from
        };
      } catch (e) {
        testResults.clientInit = { error: (e as Error).message };
      }

      // Test 3: Simple query test
      try {
        const { data, error } = await supabase.from('profiles').select('count');
        testResults.simpleQuery = {
          success: !error,
          data,
          error: error?.message
        };
      } catch (e) {
        testResults.simpleQuery = { error: (e as Error).message };
      }

      // Test 4: Auth service test
      try {
        const { data, error } = await supabase.auth.getSession();
        testResults.authService = {
          success: !error,
          hasSession: !!data.session,
          error: error?.message
        };
      } catch (e) {
        testResults.authService = { error: (e as Error).message };
      }

      // Test 5: Direct user check
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'basnetsajal120@gmail.com');
        
        testResults.userCheck = {
          success: !error,
          userExists: !!data && data.length > 0,
          userData: data,
          error: error?.message
        };
      } catch (e) {
        testResults.userCheck = { error: (e as Error).message };
      }

      // Test 6: Auth users table access (this might fail due to RLS)
      try {
        const { data, error } = await supabase.rpc('get_current_user_email');
        testResults.authUsersAccess = {
          success: !error,
          data,
          error: error?.message
        };
      } catch (e) {
        testResults.authUsersAccess = { error: (e as Error).message };
      }

    } catch (globalError) {
      testResults.globalError = (globalError as Error).message;
    } finally {
      setResults(testResults);
      setLoading(false);
    }
  };

  useEffect(() => {
    runFullTest();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Diagnostics</h1>
      
      <button
        onClick={runFullTest}
        disabled={loading}
        className="bg-green-600 px-6 py-3 rounded text-white font-medium disabled:opacity-50 mb-6"
      >
        {loading ? 'Running Tests...' : 'Rerun Tests'}
      </button>

      <div className="space-y-4">
        {Object.entries(results).map(([testName, result]) => (
          <div key={testName} className="bg-gray-900 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2 capitalize text-yellow-400">
              {testName.replace(/([A-Z])/g, ' $1')}
            </h3>
            <pre className="text-sm overflow-auto text-gray-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-900 rounded">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ul className="text-sm space-y-1">
          <li>1. Check if environment variables are loaded correctly</li>
          <li>2. Verify Supabase URL and API key are valid</li>
          <li>3. Test basic database connectivity</li>
          <li>4. Check if the user exists in the profiles table</li>
          <li>5. Test authentication service</li>
        </ul>
      </div>
    </div>
  );
};

export default SupabaseConnectionTest;