import type { Metadata } from "next";

import "./globals.css";
import Providers from "@/providers";

export const metadata: Metadata = {
    title: "NextStep",
    description: "Job Tracking Website",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
