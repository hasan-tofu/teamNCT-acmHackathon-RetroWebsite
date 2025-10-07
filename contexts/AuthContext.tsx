import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Profile } from '../types';
import { supabase, isMockMode } from '../services/supabaseClient';
import { getProfile, getUserBadges, updateLoginStreak } from '../services/api';
import * as mockApi from '../services/mockApi';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { AVATARS } from '../constants/avatars';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string, role: 'student' | 'admin') => Promise<any>;
  signup: (email: string, pass: string, username: string, role: 'student' | 'admin') => Promise<any>;
  logout: () => Promise<void>;
  refreshUserProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (isMockMode) {
        const mockUser = await mockApi.getLoggedInUser();
        setUser(mockUser);
        setLoading(false);
        return null; // No subscription to clean up
      } else {
        const { data: { session } } = await supabase!.auth.getSession();
        setSession(session);
        if (session) {
          await fetchFullUserProfile(session.user);
        }
        setLoading(false);

        const { data: { subscription } } = supabase!.auth.onAuthStateChange(
          async (_event, session) => {
            setSession(session);
            if (session) {
              await fetchFullUserProfile(session.user);
            } else {
              setUser(null);
            }
            if (loading) setLoading(false);
          }
        );
        return subscription;
      }
    };

    let subscription: { unsubscribe: () => void; } | null = null;
    initializeAuth().then(sub => {
      if(sub) subscription = sub;
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchFullUserProfile = async (supabaseUser: SupabaseUser) => {
    let profile = await getProfile(supabaseUser.id);
    const badges = await getUserBadges(supabaseUser.id);
    
    if (profile) {
        // --- Streak Logic ---
        const today = new Date();
        const lastLogin = profile.last_login ? new Date(profile.last_login) : null;
        
        const isSameDay = (d1: Date | null, d2: Date | null) => {
            if (!d1 || !d2) return false;
            return d1.getFullYear() === d2.getFullYear() &&
                   d1.getMonth() === d2.getMonth() &&
                   d1.getDate() === d2.getDate();
        };

        if (!isSameDay(today, lastLogin)) {
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            
            let newStreak = 1; // Default to 1 for today's login
            if (lastLogin && isSameDay(yesterday, lastLogin)) {
                newStreak = (profile.current_streak || 0) + 1; // Continue streak
            }
            
            // Update the profile in the backend
            const updatedProfile = await updateLoginStreak(supabaseUser.id, {
                current_streak: newStreak,
                last_login: today.toISOString()
            });

            if(updatedProfile) {
                profile = updatedProfile; // Use the fresh profile data from the update
            } else { // Fallback if update fails, update locally for the session
                profile.current_streak = newStreak;
                profile.last_login = today.toISOString();
            }
        }
        // --- End Streak Logic ---

        setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            username: profile.username,
            avatarUrl: profile.avatar_url,
            bio: profile.bio || null,
            xp: profile.xp,
            role: profile.role || 'student',
            badges: badges || [],
            currentStreak: profile.current_streak || 0,
            lastLogin: profile.last_login || new Date().toISOString(),
        });
    }
  };

  const login = async (email: string, pass: string, role: 'student' | 'admin') => {
    if (isMockMode) {
      try {
        const loggedInUser = await mockApi.login(email, pass, role);
        setUser(loggedInUser);
        return { data: { user: loggedInUser }, error: null };
      } catch (e: any) {
        return { data: null, error: e };
      }
    }
    
    const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({ email, password: pass });

    if (authError) return { data: null, error: authError };
    
    if (authData.user) {
      const profile = await getProfile(authData.user.id);
      if (profile?.role !== role) {
        // Role mismatch, sign out immediately and return an error
        await supabase!.auth.signOut();
        return { data: null, error: { message: `Access Denied: Your account does not have ${role} privileges.` } };
      }
      // Role matches, the onAuthStateChange listener will handle fetching the full profile
      return { data: authData, error: null };
    }
    
    return { data: null, error: { message: "An unknown error occurred." } };
  };

  const signup = async (email: string, pass: string, username: string, role: 'student' | 'admin') => {
    if (isMockMode) {
      try {
        const newUser = await mockApi.signup(email, pass, username, role);
        setUser(newUser);
        return { data: { user: newUser }, error: null };
      } catch (e: any) {
        return { data: null, error: e };
      }
    }
    
    return supabase!.auth.signUp({ 
        email, 
        password: pass,
        options: {
            data: {
                username,
                avatar_url: AVATARS[0], // Assign a default avatar on signup
                bio: '', // Initialize with an empty bio
                current_streak: 1, // New user starts with a streak of 1
                last_login: new Date().toISOString(),
                role: role,
            }
        }
    });
  };

  const logout = async () => {
    if (isMockMode) {
      mockApi.logout();
      setUser(null);
      return;
    }
    await supabase!.auth.signOut();
    setUser(null);
  };

  const refreshUserProfile = async () => {
    if (isMockMode) {
      const mockUser = await mockApi.getLoggedInUser();
      setUser(mockUser);
    } else if (session) {
      await fetchFullUserProfile(session.user);
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};