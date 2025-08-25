import React, { useState } from 'react';

const QuickTest: React.FC = () => {
  const [output, setOutput] = useState('');

  const addOutput = (message: string) => {
    setOutput(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + message);
  };

  const testEnvironment = () => {
    addOutput('=== Testing Environment Variables ===');
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    addOutput(`URL: ${url ? 'Present' : 'Missing'}`);
    addOutput(`Key: ${key ? 'Present (' + key.length + ' chars)' : 'Missing'}`);
    addOutput(`URL Value: ${url}`);
  };

  const testSupabaseImport = async () => {
    addOutput('=== Testing Supabase Import ===');
    try {
      const { supabase } = await import('../lib/supabase');
      addOutput('Supabase imported successfully');
      addOutput(`Has auth: ${!!supabase.auth}`);
      addOutput(`Has from: ${!!supabase.from}`);
      
      // Test basic query with manual timeout
      addOutput('Testing basic query...');
      
      const startTime = Date.now();
      
      // Manual timeout implementation
      setTimeout(() => {
        if (Date.now() - startTime > 5000) {
          addOutput('Query timed out after 5 seconds - connection issue detected');
        }
      }, 5000);
      
      try {
        const result = await supabase.from('profiles').select('count').limit(1);
        const duration = Date.now() - startTime;
        addOutput(`Query completed in ${duration}ms`);
        addOutput(`Result: ${JSON.stringify(result)}`);
      } catch (queryError) {
        addOutput(`Query error: ${queryError}`);
      }
      
    } catch (importError) {
      addOutput(`Import error: ${importError}`);
    }
  };

  const testDirectLogin = async () => {
    addOutput('=== Testing Direct Login ===');
    try {
      const { supabase } = await import('../lib/supabase');
      
      addOutput('Attempting login...');
      const startTime = Date.now();
      
      const result = await supabase.auth.signInWithPassword({
        email: 'basnetsajal120@gmail.com',
        password: '192J120SDo'
      });
      
      const duration = Date.now() - startTime;
      addOutput(`Login completed in ${duration}ms`);
      
      if (result.error) {
        addOutput(`Login error: ${result.error.message}`);
        addOutput(`Error code: ${result.error.status}`);
      } else {
        addOutput('Login successful!');
        addOutput(`User ID: ${result.data.user?.id}`);
        addOutput(`Email confirmed: ${!!result.data.user?.email_confirmed_at}`);
      }
      
    } catch (loginError) {
      addOutput(`Login exception: ${loginError}`);
    }
  };

  const clearOutput = () => {
    setOutput('');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Quick Diagnostic Test</h1>
      
      <div className="space-x-2 mb-6">
        <button 
          onClick={testEnvironment}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Test Environment
        </button>
        <button 
          onClick={testSupabaseImport}
          className="bg-green-600 px-4 py-2 rounded"
        >
          Test Supabase
        </button>
        <button 
          onClick={testDirectLogin}
          className="bg-red-600 px-4 py-2 rounded"
        >
          Test Login
        </button>
        <button 
          onClick={clearOutput}
          className="bg-gray-600 px-4 py-2 rounded"
        >
          Clear
        </button>
      </div>

      <div className="bg-gray-900 p-4 rounded">
        <h3 className="font-bold mb-2">Output:</h3>
        <pre className="text-sm whitespace-pre-wrap font-mono">
          {output || 'Click a button to start testing...'}
        </pre>
      </div>

      <div className="mt-4 text-gray-400 text-sm">
        <p>• If any test hangs without output, there's a connection/configuration issue</p>
        <p>• Test environment first, then Supabase, then login</p>
        <p>• Check browser console (F12) for additional errors</p>
      </div>
    </div>
  );
};

export default QuickTest;