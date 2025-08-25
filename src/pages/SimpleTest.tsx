import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const SimpleTest: React.FC = () => {
  const [step, setStep] = useState('');
  const [result, setResult] = useState('');

  const testStep1 = async () => {
    setStep('Testing environment variables...');
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      setResult(JSON.stringify({
        url: url ? 'Present' : 'Missing',
        key: key ? 'Present' : 'Missing',
        urlValue: url,
        keyLength: key?.length || 0
      }, null, 2));
      setStep('Environment test complete');
    } catch (e) {
      setResult('Error: ' + (e as Error).message);
    }
  };

  const testStep2 = async () => {
    setStep('Testing Supabase client...');
    try {
      const hasSupabase = !!supabase;
      const hasAuth = !!supabase?.auth;
      const hasFrom = !!supabase?.from;
      
      setResult(JSON.stringify({
        hasSupabase,
        hasAuth,
        hasFrom,
        supabaseType: typeof supabase
      }, null, 2));
      setStep('Client test complete');
    } catch (e) {
      setResult('Error: ' + (e as Error).message);
    }
  };

  const testStep3 = async () => {
    setStep('Testing basic query...');
    try {
      // Add timeout to prevent hanging
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
      );
      
      const query = supabase.from('profiles').select('count').limit(1);
      
      const response = await Promise.race([query, timeout]);
      
      setResult(JSON.stringify({
        success: true,
        data: (response as any).data,
        error: (response as any).error?.message,
        errorCode: (response as any).error?.code
      }, null, 2));
      setStep('Query test complete');
    } catch (e) {
      setResult('Error: ' + (e as Error).message);
      setStep('Query test failed');
    }
  };

  const testStep4 = async () => {
    setStep('Testing auth service...');
    try {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout after 10 seconds')), 10000)
      );
      
      const authQuery = supabase.auth.getSession();
      
      const response = await Promise.race([authQuery, timeout]);
      
      setResult(JSON.stringify({
        success: true,
        hasSession: !!response.data?.session,
        error: response.error?.message
      }, null, 2));
      setStep('Auth test complete');
    } catch (e) {
      setResult('Error: ' + (e as Error).message);
      setStep('Auth test failed');
    }
  };

  const testLogin = async () => {
    setStep('Testing login...');
    try {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout after 15 seconds')), 15000)
      );
      
      const loginQuery = supabase.auth.signInWithPassword({
        email: 'basnetsajal120@gmail.com',
        password: '192J120SDo'
      });
      
      const response = await Promise.race([loginQuery, timeout]);
      
      setResult(JSON.stringify({
        success: !response.error,
        hasUser: !!response.data?.user,
        hasSession: !!response.data?.session,
        error: response.error?.message,
        errorCode: response.error?.status
      }, null, 2));
      setStep('Login test complete');
    } catch (e) {
      setResult('Error: ' + (e as Error).message);
      setStep('Login test failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Step-by-Step Supabase Test</h1>
      
      <div className="space-y-4 mb-6">
        <button onClick={testStep1} className="bg-blue-600 px-4 py-2 rounded mr-2">
          1. Test Environment
        </button>
        <button onClick={testStep2} className="bg-green-600 px-4 py-2 rounded mr-2">
          2. Test Client
        </button>
        <button onClick={testStep3} className="bg-yellow-600 px-4 py-2 rounded mr-2">
          3. Test Query
        </button>
        <button onClick={testStep4} className="bg-purple-600 px-4 py-2 rounded mr-2">
          4. Test Auth
        </button>
        <button onClick={testLogin} className="bg-red-600 px-4 py-2 rounded">
          5. Test Login
        </button>
      </div>

      <div className="bg-gray-900 p-4 rounded mb-4">
        <h3 className="font-bold mb-2">Current Step:</h3>
        <p>{step || 'Click a button to start testing'}</p>
      </div>

      <div className="bg-gray-900 p-4 rounded">
        <h3 className="font-bold mb-2">Result:</h3>
        <pre className="text-sm overflow-auto">{result || 'No results yet'}</pre>
      </div>

      <div className="mt-6 text-gray-400 text-sm">
        <p>Test each step individually to identify where the issue occurs.</p>
        <p>If any step hangs for more than 10-15 seconds, there's a connection issue.</p>
      </div>
    </div>
  );
};

export default SimpleTest;