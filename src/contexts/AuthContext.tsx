import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isGuest: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_USER = { id: 'guest', email: '' } as unknown as User;
const GUEST_PROFILE: Profile = {
  id: 'guest',
  display_name: 'Guest',
  has_onboarded: true,
  created_at: '',
  updated_at: '',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) {
      const hasOnboarded = localStorage.getItem(`brevi_onboarded_${userId}`) === 'true';
      setProfile({ ...data, has_onboarded: hasOnboarded });
    }
  };

  const suppressAuthChange = useRef(false);

  useEffect(() => {
    let initialLoad = true;

    // Restore guest mode on reload before Supabase check
    if (localStorage.getItem('brevi_guest_mode') === 'true') {
      setUser(GUEST_USER);
      setProfile(GUEST_PROFILE);
      setIsGuest(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      }
      setLoading(false);
      initialLoad = false;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (initialLoad || suppressAuthChange.current) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    // Suppress onAuthStateChange so user+profile are set together
    suppressAuthChange.current = true;

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      suppressAuthChange.current = false;
      return { error: error.message };
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        display_name: displayName,
      });
      await supabase.from('user_settings').insert({
        user_id: data.user.id,
      });

      // Set user and profile together so the onboarding gate works
      // without a flash of the main app routes
      setProfile({
        id: data.user.id,
        display_name: displayName,
        has_onboarded: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setUser(data.user);
    }

    suppressAuthChange.current = false;
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signInAsGuest = () => {
    localStorage.setItem('brevi_guest_mode', 'true');
    setUser(GUEST_USER);
    setProfile(GUEST_PROFILE);
    setIsGuest(true);
  };

  const signOut = async () => {
    if (isGuest) {
      localStorage.removeItem('brevi_guest_mode');
      setUser(null);
      setProfile(null);
      setIsGuest(false);
      return;
    }
    await supabase.auth.signOut();
  };

  const completeOnboarding = async () => {
    if (!user) return;
    localStorage.setItem(`brevi_onboarded_${user.id}`, 'true');
    setProfile((prev) => prev ? { ...prev, has_onboarded: true } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isGuest, signUp, signIn, signInAsGuest, signOut, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
