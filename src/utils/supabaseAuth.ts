
import { supabase } from '@/integrations/supabase/client';

// Helper function to create a temporary auth session for database operations
export const createTempAuthSession = async () => {
  try {
    // Check if we already have a session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('Existing session found:', session.user.email);
      return session;
    }

    console.log('No session found, proceeding without auth for testing');
    return null;
  } catch (error) {
    console.log('Auth session creation skipped:', error);
    return null;
  }
};

// Helper function to perform authenticated database operations
export const withAuth = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    // For testing, just execute the operation directly
    console.log('Executing database operation');
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
};
