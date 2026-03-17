import { useState, useEffect } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, Mail, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Mode = 'welcome' | 'signin' | 'signup' | 'forgot_password' | 'reset_sent' | 'update_password';

export default function WelcomePage() {
  const { signIn, signUp, signInAsGuest } = useAuth();
  const [mode, setMode] = useState<Mode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Detect Supabase PASSWORD_RECOVERY event (fired when user clicks the reset link)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update_password');
        setError('');
        setPassword('');
        setConfirmPassword('');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const validate = (): string | null => {
    const trimmedEmail = email.trim();
    if (mode === 'forgot_password') {
      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return 'Please enter a valid email address.';
      }
      return null;
    }
    if (mode === 'update_password') {
      if (password.length < 6) return 'Password must be at least 6 characters.';
      if (password !== confirmPassword) return 'Passwords do not match.';
      return null;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return 'Please enter a valid email address.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (mode === 'signup') {
      if (!displayName.trim()) {
        return 'Please enter your name.';
      }
      if (!/[a-zA-Z0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
        // Soft suggestion, not blocking
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    if (mode === 'signin') {
      const result = await signIn(email.trim(), password);
      if (result.error) setError(result.error);
    } else if (mode === 'signup') {
      const result = await signUp(email.trim(), password, displayName.trim());
      if (result.error) setError(result.error);
    } else if (mode === 'forgot_password') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setMode('reset_sent');
      }
    } else if (mode === 'update_password') {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
      } else {
        await supabase.auth.signOut();
        setMode('signin');
        setPassword('');
        setConfirmPassword('');
      }
    }

    setSubmitting(false);
  };

  const goBack = () => {
    setError('');
    setPassword('');
    setConfirmPassword('');
    if (mode === 'forgot_password' || mode === 'reset_sent') {
      setMode('signin');
    } else {
      setMode('welcome');
    }
  };

  if (mode === 'welcome') {
    return (
      <div className="min-h-screen bg-alice dark:bg-jet-950 flex flex-col items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="mb-8">
            <img
              src="/logo.png"
              alt="Brevi"
              className="h-16 mx-auto mb-6 animate-bounce-in"
            />
            <p
              className="text-lg text-lilac-600 font-medium animate-fade-in"
              style={{ animationDelay: '350ms' }}
            >
              Study smarter. Rest better.
            </p>
          </div>

          <div className="space-y-3 mb-12">
            {[
              'Focused work sessions with smart timers',
              'Guided restorative breaks that recharge you',
              'Track your progress and build better habits',
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-left animate-slide-up opacity-0"
                style={{ animationDelay: `${500 + i * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-forest mt-2 shrink-0 animate-scale-in" style={{ animationDelay: `${500 + i * 100}ms` }} />
                <p className="text-jet-700 text-sm">{text}</p>
              </div>
            ))}
          </div>

          <div
            className="space-y-3 animate-slide-up opacity-0"
            style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}
          >
            <Button fullWidth onClick={() => setMode('signup')}>
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" fullWidth onClick={() => setMode('signin')}>
              I already have an account
            </Button>
            <button
              onClick={signInAsGuest}
              className="w-full text-sm text-lilac-500 hover:text-lilac-700 transition-colors py-2 font-medium"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'reset_sent') {
    return (
      <div className="min-h-screen bg-alice dark:bg-jet-950 flex flex-col items-center justify-center px-6">
        <div className="max-w-sm w-full animate-fade-in text-center">
          <div className="w-16 h-16 bg-forest-50 dark:bg-forest-950 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce-in">
            <Mail className="w-8 h-8 text-forest" />
          </div>
          <h2 className="text-2xl font-bold text-jet dark:text-jet-100 mb-2">Check your email</h2>
          <p className="text-sm text-lilac-600 mb-2">
            We sent a password reset link to
          </p>
          <p className="text-sm font-semibold text-jet dark:text-jet-100 mb-6">{email}</p>
          <p className="text-xs text-lilac-500 mb-8">
            Click the link in the email to set a new password. It may take a minute to arrive.
          </p>
          <Button variant="outline" fullWidth onClick={goBack}>
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alice dark:bg-jet-950 flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full animate-fade-in">
        {mode !== 'update_password' && (
          <button
            onClick={goBack}
            className="text-sm text-lilac-600 hover:text-jet dark:hover:text-jet-100 mb-8 font-medium transition-colors inline-flex items-center gap-1 group"
          >
            <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">&larr;</span>
            Back
          </button>
        )}

        <div className="mb-8">
          <img
            src="/logo.png"
            alt="Brevi"
            className="h-10 mb-5 animate-scale-in"
          />
          <h2 className="text-2xl font-bold text-jet dark:text-jet-100 mb-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
            {mode === 'signin' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot_password' && 'Reset your password'}
            {mode === 'update_password' && 'Set a new password'}
          </h2>
          <p className="text-sm text-lilac-600 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {mode === 'signin' && 'Sign in to continue your study sessions.'}
            {mode === 'signup' && 'Start building better study habits today.'}
            {mode === 'forgot_password' && "Enter your email and we'll send you a reset link."}
            {mode === 'update_password' && 'Choose a new password for your account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
              <label htmlFor="name" className="block text-xs font-semibold text-jet-700 dark:text-jet-300 mb-1.5">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-4 py-3 rounded-xl border border-powder-200 dark:border-jet-600 bg-white dark:bg-jet-800 text-jet dark:text-jet-100 placeholder:text-lilac-400 dark:placeholder:text-jet-500 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all duration-200 text-sm"
              />
            </div>
          )}

          {(mode === 'signin' || mode === 'signup' || mode === 'forgot_password') && (
            <div className="animate-slide-up" style={{ animationDelay: mode === 'signup' ? '200ms' : '150ms' }}>
              <label htmlFor="email" className="block text-xs font-semibold text-jet-700 dark:text-jet-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                className="w-full px-4 py-3 rounded-xl border border-powder-200 dark:border-jet-600 bg-white dark:bg-jet-800 text-jet dark:text-jet-100 placeholder:text-lilac-400 dark:placeholder:text-jet-500 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all duration-200 text-sm"
              />
            </div>
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <div className="animate-slide-up" style={{ animationDelay: mode === 'signup' ? '250ms' : '200ms' }}>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-jet-700 dark:text-jet-300">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setError(''); }}
                    className="text-xs text-forest font-medium hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-powder-200 dark:border-jet-600 bg-white dark:bg-jet-800 text-jet dark:text-jet-100 placeholder:text-lilac-400 dark:placeholder:text-jet-500 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all duration-200 text-sm pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lilac-400 hover:text-jet dark:hover:text-jet-100 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'update_password' && (
            <>
              <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
                <label htmlFor="new-password" className="block text-xs font-semibold text-jet-700 dark:text-jet-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-powder-200 dark:border-jet-600 bg-white dark:bg-jet-800 text-jet dark:text-jet-100 placeholder:text-lilac-400 dark:placeholder:text-jet-500 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all duration-200 text-sm pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lilac-400 hover:text-jet dark:hover:text-jet-100 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <label htmlFor="confirm-password" className="block text-xs font-semibold text-jet-700 dark:text-jet-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-powder-200 dark:border-jet-600 bg-white dark:bg-jet-800 text-jet dark:text-jet-100 placeholder:text-lilac-400 dark:placeholder:text-jet-500 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all duration-200 text-sm pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lilac-400 hover:text-jet dark:hover:text-jet-100 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!error && password && confirmPassword && password === confirmPassword && (
                <div className="flex items-center gap-2 text-xs text-forest animate-fade-in">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Passwords match
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-lilac-50 dark:bg-lilac-950 border border-lilac-200 dark:border-lilac-800 rounded-xl px-4 py-3 animate-scale-in">
              <p className="text-sm text-lilac-700 dark:text-lilac-300">{error}</p>
            </div>
          )}

          <div className="animate-slide-up" style={{ animationDelay: mode === 'signup' ? '300ms' : '250ms' }}>
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'signin' ? (
                'Sign In'
              ) : mode === 'signup' ? (
                'Create Account'
              ) : mode === 'forgot_password' ? (
                'Send Reset Link'
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </form>

        {(mode === 'signin' || mode === 'signup') && (
          <p className="text-center text-xs text-lilac-500 mt-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
            {mode === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  className="text-forest font-semibold hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('signin'); setError(''); }}
                  className="text-forest font-semibold hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
