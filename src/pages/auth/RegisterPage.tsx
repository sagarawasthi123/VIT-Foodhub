import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    regNo: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!form.email.endsWith('@vitstudent.ac.in') && !form.email.endsWith('@vit.ac.in')) {
      setError('Please use a VIT email address');
      return;
    }
    try {
      await register({
        name: form.name,
        email: form.email,
        regNo: form.regNo,
        password: form.password,
      });
      navigate('/student');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-muted-foreground">Register as a VIT student to start ordering</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Arjun Sharma" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">VIT Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="name@vitstudent.ac.in" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="regNo">Registration Number</Label>
          <Input id="regNo" value={form.regNo} onChange={(e) => update('regNo', e.target.value)} placeholder="23BCE1045" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
