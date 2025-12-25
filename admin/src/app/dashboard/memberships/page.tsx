'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { Check, X } from 'lucide-react';

interface Membership {
    id: string;
    planType: string;
    status: string;
    paymentStatus: string;
    totalDays: number;
    usedDays: number;
    paymentAmount?: number;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
    state?: string;
}

export default function MembershipsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get('status');

    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchMemberships = async () => {
        setLoading(true);
        const response = await adminApi.getMemberships(statusFilter || undefined);
        if (response.success && response.data) {
            setMemberships((response.data as { memberships: Membership[] }).memberships);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMemberships();
    }, [statusFilter]);

    const handleActivate = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Activate this membership?')) return;

        setActionLoading(id);
        const response = await adminApi.activateMembership(id);
        if (response.success) {
            fetchMemberships();
        } else {
            alert(response.error || 'Failed to activate');
        }
        setActionLoading(null);
    };

    const handleReject = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const reason = prompt('Enter rejection reason (optional):');
        if (reason === null) return;

        setActionLoading(id);
        const response = await adminApi.rejectMembership(id, reason);
        if (response.success) {
            fetchMemberships();
        } else {
            alert(response.error || 'Failed to reject');
        }
        setActionLoading(null);
    };

    const statusColors: Record<string, string> = {
        PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        ACTIVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        EXPIRED: 'bg-white/10 text-white/40 border-white/10',
    };

    const paymentColors: Record<string, string> = {
        PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        UNPAID: 'bg-red-500/20 text-red-400 border-red-500/30',
        FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Memberships</h1>
                <div className="flex gap-2">
                    <a
                        href="/dashboard/memberships"
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!statusFilter ? 'bg-primary text-white' : 'bg-surface border border-white/10 text-white/60 hover:text-white'}`}
                    >
                        All
                    </a>
                    <a
                        href="/dashboard/memberships?status=PENDING"
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-surface border border-white/10 text-white/60 hover:text-white'}`}
                    >
                        Pending
                    </a>
                    <a
                        href="/dashboard/memberships?status=ACTIVE"
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${statusFilter === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-surface border border-white/10 text-white/60 hover:text-white'}`}
                    >
                        Active
                    </a>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : memberships.length === 0 ? (
                <div className="text-center py-20 bg-surface border border-white/5 rounded-2xl">
                    <p className="text-white/40">No memberships found.</p>
                </div>
            ) : (
                <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">State</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Days</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {memberships.map((m) => (
                                <tr
                                    key={m.id}
                                    onClick={() => router.push(`/dashboard/users/${m.user.id}`)}
                                    className="hover:bg-white/5 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {m.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{m.user.name}</p>
                                                <p className="text-sm text-white/40">{m.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-white/60">{m.state || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-white">
                                            {m.planType === '1Y' ? '1-Year' : m.planType === '3Y' ? '3-Year' : '5-Year'}
                                        </span>
                                        {m.paymentAmount && <p className="text-sm text-white/40">₹{m.paymentAmount.toLocaleString()}</p>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[m.status] || 'bg-white/10'}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${paymentColors[m.paymentStatus] || 'bg-white/10'}`}>
                                            {m.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white/60">
                                        <span className="text-white">{m.usedDays}</span> / {m.totalDays}
                                    </td>
                                    <td className="px-6 py-4">
                                        {m.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => handleActivate(m.id, e)}
                                                    disabled={actionLoading === m.id}
                                                    className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleReject(m.id, e)}
                                                    disabled={actionLoading === m.id}
                                                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                        {m.status === 'ACTIVE' && (
                                            <span className="text-emerald-400 text-sm flex items-center gap-1">
                                                <Check size={14} /> Active
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
