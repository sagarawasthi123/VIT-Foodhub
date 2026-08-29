import { useState } from 'react';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export function ForgotPasswordPage() {
  const { requestPasswordReset, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">Reset link sent</h1>
        <p className="mt-2 text-muted-foreground">
          We've sent a password reset link to <span className="font-medium">{email}</span>. Check your inbox.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Forgot password?</h1>
      <p className="mt-1 text-muted-foreground">Enter your email and we'll send you a reset link</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@vitstudent.ac.in"
              className="pl-9"
              required
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
        </Button>
      </form>
    </div>
  );
}
