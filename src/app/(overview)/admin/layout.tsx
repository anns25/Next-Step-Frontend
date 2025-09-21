"use client";

import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';
import React from 'react';


interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedAdminRoute>
      {children}
    </ProtectedAdminRoute>
  );
}