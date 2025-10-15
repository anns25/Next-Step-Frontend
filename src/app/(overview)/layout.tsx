import AuthCheck from "@/components/AuthCheck";
import type { Metadata } from "next";


export const metadata: Metadata = {
    title: "Next Step",
    description: "Job Tracker",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>   
            <AuthCheck />  
            {children}
          
        </>
    );
}
