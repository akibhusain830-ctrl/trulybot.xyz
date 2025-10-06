'use client';

import OptimizedDashboardLayout from '@/components/OptimizedDashboardLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <OptimizedDashboardLayout>
      {children}
    </OptimizedDashboardLayout>
  );
}
