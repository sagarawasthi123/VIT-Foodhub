import { Outlet, Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left brand panel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-600 to-green-800 p-12 flex-col justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold">VIT FoodHub</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Smart Food Court Ordering & Queue Management
          </h2>
          <p className="mt-3 text-green-100">
            Skip the queue, order ahead, and pick up your food with a virtual token.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-green-100">Food Courts</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-2xl font-bold">6+</p>
              <p className="text-xs text-green-100">Shops</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-2xl font-bold">18+</p>
              <p className="text-xs text-green-100">Food Items</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-green-200">VIT University · Course Project</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-muted/30">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-primary">VIT FoodHub</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
