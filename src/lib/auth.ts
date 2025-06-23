
// Authentication untuk hosting environment
import { database } from '@/lib/database';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface AuthSession {
  user: User;
  token: string;
  expires_at: string;
  loginTime: string; // Add login timestamp
}

class AuthClient {
  private currentSession: AuthSession | null = null;

  constructor() {
    // Load session from localStorage on init
    this.loadSession();
  }

  private loadSession() {
    try {
      const sessionData = localStorage.getItem('auth_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Check if session is older than 1 day
        if (session.loginTime) {
          const oneDayInMs = 24 * 60 * 60 * 1000;
          const loginDate = new Date(session.loginTime);
          const now = new Date();
          
          if ((now.getTime() - loginDate.getTime()) > oneDayInMs) {
            console.log('Session expired, clearing...');
            this.clearSession();
            return;
          }
        }
        
        if (new Date(session.expires_at) > new Date()) {
          this.currentSession = session;
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      this.clearSession();
    }
  }

  private saveSession(session: AuthSession) {
    this.currentSession = session;
    localStorage.setItem('auth_session', JSON.stringify(session));
  }

  private clearSession() {
    this.currentSession = null;
    localStorage.removeItem('auth_session');
  }

  async signIn(email: string, password: string) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      if (data.success) {
        // Add login timestamp
        const sessionWithTimestamp = {
          ...data.session,
          loginTime: new Date().toISOString()
        };
        this.saveSession(sessionWithTimestamp);
        return { data: { user: sessionWithTimestamp.user }, error: null };
      } else {
        return { data: null, error: { message: data.message } };
      }
    } catch (error) {
      return { data: null, error: { message: 'Login failed' } };
    }
  }

  async signOut() {
    try {
      if (this.currentSession) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.currentSession.token}`,
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearSession();
    }
  }

  getUser() {
    return this.currentSession?.user || null;
  }

  getSession() {
    return this.currentSession;
  }

  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
    // Simulate auth state changes
    const checkSession = () => {
      callback('SIGNED_IN', this.currentSession);
    };
    
    checkSession();
    
    // Return unsubscribe function
    return {
      data: { subscription: { unsubscribe: () => {} } }
    };
  }
}

export const auth = new AuthClient();
