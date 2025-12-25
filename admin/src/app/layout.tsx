import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "TravelTrek Admin",
    description: "Admin panel for TravelTrek membership management",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased" suppressHydrationWarning>{children}</body>
        </html>
    );
}
