import { useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthError, FormField, SubmitButton } from '../components/auth/FormField';
import { useAuthStore } from '../stores/authStore';

export function Login() {
  const { signIn, loading, error, clearError, setAuthView } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn({ email, password });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your OutreachOS account"
      footer={
        <p className="text-small text-text-secondary">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => {
              clearError();
              setAuthView('register');
            }}
            className="text-accent-primary hover:text-accent-hover font-medium"
          >
            Register
          </button>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthError message={error} />
        <FormField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@company.com"
        />
        <FormField
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
        <SubmitButton loading={loading}>Sign in</SubmitButton>
      </form>
    </AuthLayout>
  );
}
