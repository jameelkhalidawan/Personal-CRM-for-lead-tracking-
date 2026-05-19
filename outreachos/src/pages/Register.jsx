import { useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthError, FormField, SubmitButton } from '../components/auth/FormField';
import { useAuthStore } from '../stores/authStore';

export function Register() {
  const { signUp, loading, error, clearError, setAuthView } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signUp({ name, email, password, confirmPassword });
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Register once — you'll stay signed in on this device"
      footer={
        <p className="text-small text-text-secondary">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => {
              clearError();
              setAuthView('login');
            }}
            className="text-accent-primary hover:text-accent-hover font-medium"
          >
            Sign in
          </button>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthError message={error} />
        <FormField
          id="register-name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          placeholder="Your name"
        />
        <FormField
          id="register-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@company.com"
        />
        <FormField
          id="register-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="At least 6 characters"
        />
        <FormField
          id="register-confirm"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Repeat password"
        />
        <SubmitButton loading={loading}>Create account</SubmitButton>
      </form>
    </AuthLayout>
  );
}
