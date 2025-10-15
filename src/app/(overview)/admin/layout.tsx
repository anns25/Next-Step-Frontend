"use client";

import AdminSidebarLayout from '@/components/AdminSidebarLayout';
import AuthCheck from '@/components/AuthCheck';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';
import React from 'react';


interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <>
      <AuthCheck />
      <ProtectedAdminRoute>
        <AdminSidebarLayout>{children}</AdminSidebarLayout>
      </ProtectedAdminRoute>
    </>
  );
}