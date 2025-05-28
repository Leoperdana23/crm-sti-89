
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for sales user in localStorage first
    const salesUser = localStorage.getItem('salesUser');
    if (salesUser) {
      try {
        const parsedSalesUser = JSON.parse(salesUser);
        setUser(parsedSalesUser);
        setLoading(false);
        return;
      } catch (error) {
        // Invalid sales user data, remove it
        localStorage.removeItem('salesUser');
      }
    }

    // Set up auth state listener for regular Supabase auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Clear sales user if regular auth is active
        if (session?.user) {
          localStorage.removeItem('salesUser');
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Sign out from both regular auth and sales auth
    await supabase.auth.signOut();
    localStorage.removeItem('salesUser');
    setUser(null);
    setSession(null);
  };

  return {
    user,
    session,
    loading,
    signOut,
  };
};
