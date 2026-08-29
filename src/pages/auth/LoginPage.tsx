import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Store, ShieldCheck, Loader2 } from 'lucide-react';
import type { Role } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';

const DEMO_ACCOUNTS: { role: Role; label: string; icon: React.ReactNode; email: string }[] = [
  { role: 'student', label: 'Student', icon: <GraduationCap className="h-5 w-5" />, email: 'arjun.sharma2023@vitstudent.ac.in' },
  { role: 'shopkeeper', label: 'Shopkeeper', icon: <Store className="h-5 w-5" />, email: 'ravi.kumar@vit.ac.in' },
  { role: 'admin', label: 'Administrator', icon: <ShieldCheck className="h-5 w-5" />, email: 'sunita.menon@vit.ac.in' },
];

export function LoginPage() {
  const { login, loginByRole, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  async function handleDemoLogin(role: Role) {
    setError('');
    setSelectedRole(role);
    try {
      const user = await loginByRole(role);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setSelectedRole(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-muted-foreground">Sign in to your VIT FoodHub account</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email or Registration Number</Label>
          <Input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="arjun.sharma2023@vitstudent.ac.in"
            required
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
