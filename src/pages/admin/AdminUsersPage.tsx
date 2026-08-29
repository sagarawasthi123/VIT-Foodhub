import { useState, useEffect } from 'react';
import { Users, GraduationCap, Store, ShieldCheck } from 'lucide-react';
import { getAllUsers, updateUserRole } from '../../services/adminService';
import type { User, Role } from '../../types';
import { Card } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { EmptyState } from '../../components/common/EmptyState';

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  student: <GraduationCap className="h-4 w-4" />,
  shopkeeper: <Store className="h-4 w-4" />,
  admin: <ShieldCheck className="h-4 w-4" />,
};

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    load();
  }, []);

  function load() {
    getAllUsers().then(setUsers);
  }

  async function changeRole(userId: string, role: Role) {
    await updateUserRole(userId, role);
    load();
  }

  if (users.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <EmptyState icon={<Users className="h-8 w-8" />} title="No users" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage user roles and permissions</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {(['student', 'shopkeeper', 'admin'] as Role[]).map((role) => {
          const count = users.filter((u) => u.role === role).length;
          return (
            <Card key={role} className="p-4 text-center">
              <div className="flex justify-center mb-2 text-primary">{ROLE_ICONS[role]}</div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}s</p>
            </Card>
          );
        })}
      </div>

      {/* Users table */}
      <Card className="p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Reg No</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="py-3 text-muted-foreground">{u.email}</td>
                <td className="py-3 text-muted-foreground">{u.regNo ?? '-'}</td>
                <td className="py-3">
                  <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="py-3">
                  <Select value={u.role} onValueChange={(v) => changeRole(u.id, v as Role)}>
                    <SelectTrigger className="w-36 h-8 text-xs capitalize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="shopkeeper">Shopkeeper</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
