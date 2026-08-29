import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Store,
  ShoppingBag,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  UtensilsCrossed,
  LayoutDashboard,
  ClipboardList,
  Package,
  Boxes,
  QrCode,
  Building2,
  Users,
  BarChart3,
  Bell,
} from 'lucide-react';
import type { Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { NotificationDropdown } from '../components/common/NotificationDropdown';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const NAV: Record<Role, NavItem[]> = {
  student: [
    { label: 'Home', to: '/student', icon: <Home className="h-5 w-5" /> },
    { label: 'Food Courts', to: '/student/food-courts', icon: <Store className="h-5 w-5" /> },
    { label: 'Orders', to: '/student/orders', icon: <ShoppingBag className="h-5 w-5" /> },
    { label: 'Cart', to: '/student/cart', icon: <ShoppingCart className="h-5 w-5" /> },
    { label: 'Favourites', to: '/student/favourites', icon: <Heart className="h-5 w-5" /> },
    { label: 'Profile', to: '/student/profile', icon: <User className="h-5 w-5" /> },
  ],
  shopkeeper: [
    { label: 'Dashboard', to: '/shopkeeper', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Orders', to: '/shopkeeper/orders', icon: <ClipboardList className="h-5 w-5" /> },
    { label: 'Menu', to: '/shopkeeper/menu', icon: <UtensilsCrossed className="h-5 w-5" /> },
    { label: 'Inventory', to: '/shopkeeper/inventory', icon: <Boxes className="h-5 w-5" /> },
    { label: 'Token Verification', to: '/shopkeeper/tokens', icon: <QrCode className="h-5 w-5" /> },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Food Courts', to: '/admin/food-courts', icon: <Building2 className="h-5 w-5" /> },
    { label: 'Shops', to: '/admin/shops', icon: <Store className="h-5 w-5" /> },
    { label: 'Users', to: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { label: 'Reports', to: '/admin/reports', icon: <BarChart3 className="h-5 w-5" /> },
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  student: 'Student',
  shopkeeper: 'Shopkeeper',
  admin: 'Administrator',
};

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = NAV[user.role];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const sidebar = (
    <div className="flex h-full flex-col w-full min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-5 border-b shrink-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-base leading-tight truncate">VIT FoodHub</p>
          <p className="text-xs text-muted-foreground truncate">{ROLE_LABELS[user.role]}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-w-0">
        {navItems.map((item) => {
          const active =
            location.pathname === item.to ||
            (item.to !== `/${user.role}` && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-w-0',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
              {item.label === 'Cart' && totalItems > 0 && (
                <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start mt-1 text-muted-foreground" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2 shrink-0" /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 border-r bg-card z-30 overflow-hidden">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r bg-card">
            <button
              className="absolute top-4 right-4 z-10"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 min-w-0 flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-card/80 backdrop-blur px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold capitalize">
              {navItems.find((n) => location.pathname.startsWith(n.to) && n.to !== `/${user.role}`) ||
              location.pathname === `/${user.role}`
                ? navItems.find((n) => n.to === location.pathname)?.label ||
                  (location.pathname === `/${user.role}` ? 'Dashboard' : '')
                : ''}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {user.role === 'student' && <NotificationDropdown />}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="md:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-6 max-w-7xl mx-auto w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
