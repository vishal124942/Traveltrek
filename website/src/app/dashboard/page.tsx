'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Membership {
    planType: string;
    status: string;
    remainingDays: number;
    usedDays: number;
    totalDays: number;
    startDate: string;
    endDate: string;
}

interface User {
    name: string;
    email: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [membership, setMembership] = useState<Membership | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const token = api.getToken();
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const [profileRes, membershipRes] = await Promise.all([
                    api.getProfile(),
                    api.getMembership(),
                ]);

                if (profileRes.success && profileRes.data?.user) {
                    setUser(profileRes.data.user as User);
                } else {
                    router.push('/login');
                    return;
                }

                // Backend returns { membership: {...} } or { membership: null }
                if (membershipRes.success && membershipRes.data?.membership) {
                    setMembership(membershipRes.data.membership as Membership);
                }
            } catch {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [router]);

    const handleLogout = () => {
        api.logout();
        router.push('/');
    };

    const planLabels: Record<string, string> = {
        '1Y': '1-Year Membership',
        '3Y': '3-Year Membership',
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                {/* Welcome Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                            Welcome back, {user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-[var(--text-secondary)]">Here&apos;s your travel dashboard</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Membership Card */}
                <div className="gradient-primary rounded-3xl p-8 card-shadow-lg mb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-white/70 text-sm mb-1">🎫 MEMBERSHIP CARD</p>
                            <h2 className="text-2xl font-bold text-white">
                                {membership ? planLabels[membership.planType] || membership.planType : 'No Active Membership'}
                            </h2>
                        </div>
                        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${membership?.status?.toLowerCase() === 'active'
                            ? 'bg-[var(--success)] text-white'
                            : 'bg-[var(--warning)] text-white'
                            }`}>
                            {membership?.status?.toUpperCase() || 'INACTIVE'}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-white/15 rounded-2xl p-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">{membership?.remainingDays || 0}</p>
                            <p className="text-white/70 text-sm">Remaining</p>
                        </div>
                        <div className="text-center border-x border-white/20">
                            <p className="text-3xl font-bold text-white">{membership?.usedDays || 0}</p>
                            <p className="text-white/70 text-sm">Used</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">{membership?.totalDays || 0}</p>
                            <p className="text-white/70 text-sm">Total</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Link
                        href="/chat"
                        className="bg-white rounded-2xl p-6 card-shadow hover:card-shadow-lg transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-2xl">🤖</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--text-primary)]">AI Assistant</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Get travel recommendations</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/destinations"
                        className="bg-white rounded-2xl p-6 card-shadow hover:card-shadow-lg transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-[var(--accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-2xl">🏔️</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--text-primary)]">Explore Destinations</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Plan your next adventure</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Membership Details */}
                {membership && (
                    <div className="bg-white rounded-2xl p-6 card-shadow">
                        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Membership Details</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-[var(--text-secondary)]">Plan Type</span>
                                <span className="font-medium">{planLabels[membership.planType]}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--text-secondary)]">Start Date</span>
                                <span className="font-medium">
                                    {membership.startDate ? new Date(membership.startDate).toLocaleDateString() : 'Not activated'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--text-secondary)]">Expiry Date</span>
                                <span className="font-medium">
                                    {membership.endDate ? new Date(membership.endDate).toLocaleDateString() : 'Not activated'}
                                </span>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[var(--text-secondary)]">Days Progress</span>
                                    <span className="text-sm text-[var(--text-secondary)]">
                                        {membership.usedDays} / {membership.totalDays} days used
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-[var(--background)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full gradient-primary rounded-full transition-all"
                                        style={{ width: `${(membership.usedDays / membership.totalDays) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
