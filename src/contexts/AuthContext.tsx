import React, { createContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase, isUserAdmin } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use timeout to prevent hanging
          try {
            const adminCheckPromise = isUserAdmin();
            const timeoutPromise = new Promise<boolean>((_, reject) => 
              setTimeout(() => reject(new Error('Admin check timeout')), 3000)
            );
            
            const adminStatus = await Promise.race([adminCheckPromise, timeoutPromise]);
            setIsAdmin(adminStatus);
          } catch (error) {
            console.warn('Admin check failed, using email fallback:', error);
            setIsAdmin(session.user.email === 'basnetsajal120@gmail.com');
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Session check failed:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const adminCheckPromise = isUserAdmin();
          const timeoutPromise = new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('Admin check timeout')), 3000)
          );
          
          const adminStatus = await Promise.race([adminCheckPromise, timeoutPromise]);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.warn('Admin check failed during auth change, using email fallback:', error);
          setIsAdmin(session.user.email === 'basnetsajal120@gmail.com');
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data.user && !error) {
      try {
        const adminCheckPromise = isUserAdmin();
        const timeoutPromise = new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Admin check timeout')), 3000)
        );
        
        const adminStatus = await Promise.race([adminCheckPromise, timeoutPromise]);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.warn('Admin check failed during sign in, using email fallback:', error);
        setIsAdmin(data.user.email === 'basnetsajal120@gmail.com');
      }
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    isAdmin,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};