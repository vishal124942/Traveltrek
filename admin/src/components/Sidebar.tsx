'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    Users,
    CreditCard,
    Map,
    FileText,
    LogOut,
    Menu,
    X,
    PieChart,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Users', href: '/dashboard/users' },
    { icon: CreditCard, label: 'Memberships', href: '/dashboard/memberships' },
    { icon: PieChart, label: 'Plans', href: '/dashboard/plans' },
    { icon: Map, label: 'Destinations', href: '/dashboard/destinations' },
    { icon: FileText, label: 'Brochures', href: '/dashboard/brochures' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface border border-white/10 rounded-full text-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-full w-72 bg-surface border-r border-white/5 z-40",
                    "flex flex-col p-6 transition-transform duration-200",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    "lg:translate-x-0"
                )}
            >
                <div className="mb-10 flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">TravelTrek</h1>
                        <p className="text-xs text-white/40 font-medium">ADMIN PANEL</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={true}
                            >
                                <div className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                                    isActive
                                        ? "text-white bg-white/5 border-l-2 border-primary"
                                        : "text-white/40 hover:text-white hover:bg-white/5"
                                )}>
                                    <Icon size={20} className={isActive ? "text-primary" : ""} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </aside>
        </>
    );
}
