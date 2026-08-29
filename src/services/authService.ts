import { supabase } from '../lib/supabase';
import type { User, Role } from '../types';

export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const profile = await fetchProfile(data.user.id);
  return profile;
}

export async function loginByRole(role: Role): Promise<User> {
  await delay();
  const demoEmails: Record<Role, string> = {
    student: 'arjun.sharma2023@vitstudent.ac.in',
    shopkeeper: 'ravi.kumar@vit.ac.in',
    admin: 'sunita.menon@vit.ac.in',
  };
  const email = demoEmails[role];
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: 'password' });
  if (error) {
    throw new Error(`Demo login failed: ${error.message}. Please create the demo accounts first.`);
  }

  const profile = await fetchProfile(data.user.id);
  return profile;
}

export async function register(data: {
  name: string;
  email: string;
  regNo: string;
  password: string;
}): Promise<User> {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });
  if (error) throw new Error(error.message);
  if (!authData.user) throw new Error('Registration failed');

  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    name: data.name,
    email: data.email,
    reg_no: data.regNo,
    role: 'student',
    status: 'active',
  });
  if (profileError) throw new Error(profileError.message);

  return {
    id: authData.user.id,
    name: data.name,
    email: data.email,
    regNo: data.regNo,
    role: 'student',
    status: 'active',
    createdAt: new Date().toISOString(),
  };
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
}

export async function fetchProfile(userId: string): Promise<User> {
  const res = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (res.error) throw new Error(res.error.message);
  if (!res.data) throw new Error('Profile not found. Please contact support.');

  return {
    id: res.data.id,
    name: res.data.name,
    email: res.data.email,
    regNo: res.data.reg_no,
    role: res.data.role as Role,
    status: res.data.status,
    createdAt: res.data.created_at,
  };
}

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
