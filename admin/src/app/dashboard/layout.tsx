'use client';

import Sidebar from '@/components/Sidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-white font-sans">
            <div className="flex">
                <Sidebar />

                <main className="flex-1 lg:ml-72 min-h-screen p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
