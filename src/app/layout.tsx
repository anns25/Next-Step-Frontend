import type { Metadata } from "next";

import "./globals.css";
import Providers from "@/providers";
import ShareThis from "@/components/ShareThis";

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
                    <ShareThis propertyId="68ef34339ac1bf93b5eb2057" />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
