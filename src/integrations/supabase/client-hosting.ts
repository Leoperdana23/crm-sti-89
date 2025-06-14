// Client untuk hosting environment (replacement untuk Supabase client)
import { database } from '@/lib/database';
import { auth } from '@/lib/auth';

// Simulate Supabase client interface
export const supabase = {
  from: (table: string) => database.from(table),
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      return auth.signIn(email, password);
    },
    signOut: async () => {
      await auth.signOut();
      return { error: null };
    },
    getUser: () => {
      const user = auth.getUser();
      return { data: { user }, error: null };
    },
    getSession: async () => {
      const session = auth.getSession();
      return { data: { session }, error: null };
    },
    onAuthStateChange: (callback: any) => {
      return auth.onAuthStateChange(callback);
    }
  },
  // Keep existing interface for compatibility
  rpc: async (functionName: string, params: any = {}) => {
    try {
      const response = await fetch('/api/functions/' + functionName, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth.getSession() ? `Bearer ${auth.getSession()?.token}` : ''
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`Function call failed: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};
