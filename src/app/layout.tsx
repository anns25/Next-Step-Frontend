import type { Metadata } from "next";

import "./globals.css";
import Providers from "@/providers";
import ShareThis from "@/components/ShareThis";
import Script from "next/script";

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
            <head>
                <Script
                    src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
                    strategy="beforeInteractive"
                />
            </head>
            <body>
                <Providers>
                    <ShareThis propertyId="68ef34339ac1bf93b5eb2057" />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
