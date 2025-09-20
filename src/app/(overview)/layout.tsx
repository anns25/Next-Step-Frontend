import type { Metadata } from "next";

import SidebarLayout from "@/components/SidebarLayout";
import AuthCheck from "@/components/AuthCheck";

export const metadata: Metadata = {
  title: "nextStep",
  description: "Job Tracking Website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
        <AuthCheck />
        {/* SidebarLayout already manages sidebar + main content */}
        <SidebarLayout>{children}</SidebarLayout>
   </div>
  );
}
