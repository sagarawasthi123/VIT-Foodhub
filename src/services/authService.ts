import type { User, Role } from '../types';
import { mockUsers } from '../data/mockData';

// Replace these mock functions with real API calls (e.g. fetch to /api/auth) later.

export async function login(
  email: string,
  password: string
): Promise<User> {
  await delay();
  const user = mockUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (!user) throw new Error('Invalid credentials. Try the demo accounts.');
  if (password !== 'password' && password !== 'vit123')
    throw new Error('Invalid credentials. Try the demo accounts.');
  return user;
}

export async function loginByRole(role: Role): Promise<User> {
  await delay();
  const user = mockUsers.find((u) => u.role === role);
  if (!user) throw new Error('No demo account for this role.');
  return user;
}

export async function register(data: {
  name: string;
  email: string;
  regNo: string;
  password: string;
}): Promise<User> {
  await delay();
  const exists = mockUsers.find((u) => u.email === data.email);
  if (exists) throw new Error('An account with this email already exists.');
  const user: User = {
    id: `u${mockUsers.length + 1}`,
    name: data.name,
    email: data.email,
    regNo: data.regNo,
    role: 'student',
    status: 'active',
    createdAt: new Date().toISOString().slice(0, 10),
  };
  mockUsers.push(user);
  return user;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await delay();
  const user = mockUsers.find((u) => u.email === email);
  if (!user) throw new Error('No account found with this email.');
}

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
