"use client";

import AdminSidebarLayout from '@/components/AdminSidebarLayout';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';
import React from 'react';


interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedAdminRoute>
      <AdminSidebarLayout>{children}</AdminSidebarLayout>
    </ProtectedAdminRoute>
  );
}