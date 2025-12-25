'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Users, CreditCard, TrendingUp, Activity, UserCheck, Clock } from 'lucide-react';

interface Stats {
    totalUsers: number;
    activeMemberships: number;
    pendingMemberships: number;
    totalDestinations: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const response = await adminApi.getStats();
            if (response.success && response.data) {
                setStats((response.data as { stats: Stats }).stats);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'bg-primary/20 text-primary',
            borderColor: 'border-primary/20'
        },
        {
            title: 'Active Members',
            value: stats?.activeMemberships || 0,
            icon: UserCheck,
            color: 'bg-emerald-500/20 text-emerald-400',
            borderColor: 'border-emerald-500/20'
        },
        {
            title: 'Pending Requests',
            value: stats?.pendingMemberships || 0,
            icon: Clock,
            color: 'bg-amber-500/20 text-amber-400',
            borderColor: 'border-amber-500/20'
        },
        {
            title: 'Destinations',
            value: stats?.totalDestinations || 0,
            icon: TrendingUp,
            color: 'bg-sky-500/20 text-sky-400',
            borderColor: 'border-sky-500/20'
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-white/40">Overview of your travel platform</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className={`bg-surface border ${stat.borderColor} rounded-2xl p-6 transition-all hover:scale-[1.02]`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    <Icon size={24} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-white/40 text-sm">{stat.title}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-surface border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <a
                        href="/dashboard/memberships?status=PENDING"
                        className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-xl text-sm font-medium hover:bg-amber-500/30 transition-colors"
                    >
                        View Pending ({stats?.pendingMemberships || 0})
                    </a>
                    <a
                        href="/dashboard/users"
                        className="px-4 py-2 bg-primary/20 text-primary rounded-xl text-sm font-medium hover:bg-primary/30 transition-colors"
                    >
                        Manage Users
                    </a>
                    <a
                        href="/dashboard/plans"
                        className="px-4 py-2 bg-white/5 text-white/60 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
                    >
                        Edit Plans
                    </a>
                    <a
                        href="/dashboard/destinations"
                        className="px-4 py-2 bg-white/5 text-white/60 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
                    >
                        Manage Destinations
                    </a>
                </div>
            </div>
        </div>
    );
}
