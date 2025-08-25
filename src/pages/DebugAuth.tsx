import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DebugAuth: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEverything = async () => {
      try {
        // 1. Check Supabase connection
        const { data: connectionTest, error: connectionError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        // 2. Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // 3. Try to get user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        // 4. Check if user exists in auth.users
        let userInAuth = null;
        let userInAuthError = null;
        try {
          const { data, error } = await supabase.rpc('get_user_by_email', { 
            user_email: 'basnetsajal120@gmail.com' 
          });
          userInAuth = data;
          userInAuthError = error;
        } catch (e) {
          userInAuthError = e;
        }

        // 5. Check if profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'basnetsajal120@gmail.com')
          .single();

        // 6. Try direct login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: 'basnetsajal120@gmail.com',
          password: '192J120SDo'
        });

        setDebugInfo({
          connection: {
            success: !connectionError,
            error: connectionError?.message
          },
          session: {
            exists: !!session,
            user: session?.user,
            error: sessionError?.message
          },
          user: {
            exists: !!user,
            data: user,
            error: userError?.message
          },
          userInAuth: {
            exists: !!userInAuth,
            data: userInAuth,
            error: userInAuthError?.message
          },
          profile: {
            exists: !!profileData,
            data: profileData,
            error: profileError?.message
          },
          login: {
            success: !loginError,
            data: loginData,
            error: loginError?.message
          }
        });

      } catch (error) {
        console.error('Debug error:', error);
        setDebugInfo({ error: error.message });
      } finally {
        setLoading(false);
      }
    };

    checkEverything();
  }, []);

  if (loading) {
    return <div className="p-8">Loading debug info...</div>;
  }

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-6">
        {Object.entries(debugInfo).map(([key, value]) => (
          <div key={key} className="bg-gray-900 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2 capitalize">{key}</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 px-4 py-2 rounded text-white"
        >
          Refresh Debug
        </button>
      </div>
    </div>
  );
};

export default DebugAuth;