
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isSessionExpired = (loginTime: string) => {
    const oneDayInMs = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    const loginDate = new Date(loginTime);
    const now = new Date();
    return (now.getTime() - loginDate.getTime()) > oneDayInMs;
  };

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      try {
        // First check for app user in localStorage
        const appUser = localStorage.getItem('appUser');
        if (appUser) {
          try {
            const parsedAppUser = JSON.parse(appUser);
            
            // Check if session is older than 1 day
            if (parsedAppUser.loginTime && isSessionExpired(parsedAppUser.loginTime)) {
              console.log('App user session expired, removing...');
              localStorage.removeItem('appUser');
              setUser(null);
              setLoading(false);
              return;
            }
            
            console.log('App user found in localStorage:', parsedAppUser.email);
            const mockUser = {
              id: parsedAppUser.id || 'app-user-id',
              email: parsedAppUser.email,
              aud: 'authenticated',
              role: 'authenticated',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              email_confirmed_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              app_metadata: {
                provider: 'email',
                providers: ['email']
              },
              user_metadata: {
                role: parsedAppUser.user_metadata?.role || 'super_admin',
                full_name: parsedAppUser.user_metadata?.full_name || 'App User'
              },
              identities: [],
              factors: []
            } as User;
            setUser(mockUser);
            setLoading(false);
            return;
          } catch (error) {
            console.error('Error parsing app user:', error);
            localStorage.removeItem('appUser');
          }
        }

        // Check for regular Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.log('Auth error:', error);
        }
        
        if (session?.user) {
          console.log('User session found:', session.user.email);
          setUser(session.user);
        } else {
          console.log('No valid session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes, but don't override app user sessions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      // Only update user state if there's no app user in localStorage
      const appUser = localStorage.getItem('appUser');
      if (!appUser) {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('appUser');
      localStorage.removeItem('salesUser');
      setUser(null);
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      // Force sign out even if there's an error
      localStorage.removeItem('appUser');
      localStorage.removeItem('salesUser');
      setUser(null);
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
