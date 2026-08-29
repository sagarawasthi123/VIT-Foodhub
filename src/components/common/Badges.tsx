import type { CrowdLevel, OrderStatus, Availability } from '../../types';
import { cn } from '../../lib/utils';

export function CrowdBadge({ crowd }: { crowd: CrowdLevel }) {
  const config: Record<CrowdLevel, { label: string; className: string }> = {
    low: { label: 'Low Crowd', className: 'bg-green-100 text-green-700' },
    moderate: { label: 'Moderate', className: 'bg-yellow-100 text-yellow-700' },
    busy: { label: 'Busy', className: 'bg-red-100 text-red-700' },
  };
  const c = config[crowd];
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', c.className)}>
      {c.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<OrderStatus, { label: string; className: string }> = {
    placed: { label: 'Placed', className: 'bg-blue-100 text-blue-700' },
    accepted: { label: 'Accepted', className: 'bg-indigo-100 text-indigo-700' },
    preparing: { label: 'Preparing', className: 'bg-yellow-100 text-yellow-700' },
    ready: { label: 'Ready', className: 'bg-green-100 text-green-700' },
    completed: { label: 'Completed', className: 'bg-gray-200 text-gray-700' },
  };
  const c = config[status];
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', c.className)}>
      {c.label}
    </span>
  );
}

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  const config: Record<Availability, { label: string; className: string }> = {
    available: { label: 'Available', className: 'bg-green-100 text-green-700' },
    low_stock: { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-700' },
    out_of_stock: { label: 'Out of Stock', className: 'bg-red-100 text-red-700' },
  };
  const c = config[availability];
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', c.className)}>
      {c.label}
    </span>
  );
}

export function VegIndicator({ type }: { type: 'veg' | 'non_veg' }) {
  return (
    <span
      className={cn(
        'inline-flex h-4 w-4 items-center justify-center rounded-sm border-2',
        type === 'veg' ? 'border-green-600' : 'border-red-600'
      )}
      title={type === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          type === 'veg' ? 'bg-green-600' : 'bg-red-600'
        )}
      />
    </span>
  );
}
