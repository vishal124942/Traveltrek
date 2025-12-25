'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminApi } from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard';
import { Mail, Phone, Calendar, MapPin, Save, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

interface Destination {
    id: string;
    name: string;
}

interface UserDetail {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
    membership?: {
        id: string;
        planType: string;
        status: string;
        totalDays: number;
        usedDays: number;
        customDaysAdded: number;
        customDestinations: Destination[];
        startDate?: string;
        endDate?: string;
    };
}

export default function UserDetailPage() {
    const params = useParams();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [customDays, setCustomDays] = useState(0);
    const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);

    const fetchData = async () => {
        setLoading(true);
        const [usersRes, destRes] = await Promise.all([
            adminApi.getUsers(),
            adminApi.getDestinations()
        ]);

        if (usersRes.success && usersRes.data) {
            const foundUser = (usersRes.data as { users: UserDetail[] }).users.find(u => u.id === params.id);
            if (foundUser) {
                setUser(foundUser);
                setCustomDays(foundUser.membership?.customDaysAdded || 0);
                setSelectedDestinations(foundUser.membership?.customDestinations?.map(d => d.id) || []);
            }
        }
        if (destRes.success && destRes.data) {
            setDestinations((destRes.data as { destinations: Destination[] }).destinations);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        if (!user?.membership) return;
        setSaving(true);

        const response = await adminApi.updateMembership(user.id, {
            customDaysAdded: customDays,
            customDestinationIds: selectedDestinations
        });

        if (response.success) {
            alert('Saved!');
            fetchData();
        } else {
            alert(response.error || 'Failed');
        }
        setSaving(false);
    };

    const toggleDestination = (destId: string) => {
        if (selectedDestinations.includes(destId)) {
            setSelectedDestinations(selectedDestinations.filter(id => id !== destId));
        } else {
            setSelectedDestinations([...selectedDestinations, destId]);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <div className="text-white">User not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/users" className="p-2 bg-white/5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-3xl font-bold text-white">User Profile</h1>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* User Info */}
                <GlassCard className="lg:col-span-1">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3">
                            {user.name.charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-white">{user.name}</h2>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/60 mt-2">{user.role}</span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-white/60 p-3 bg-white/5 rounded-xl">
                            <Mail size={16} className="text-primary" />
                            <span className="text-sm">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/60 p-3 bg-white/5 rounded-xl">
                            <Phone size={16} className="text-primary" />
                            <span className="text-sm">{user.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/60 p-3 bg-white/5 rounded-xl">
                            <Calendar size={16} className="text-primary" />
                            <span className="text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </GlassCard>

                {/* Membership */}
                <div className="lg:col-span-2">
                    {user.membership ? (
                        <GlassCard>
                            <h3 className="text-lg font-bold text-white mb-4">Membership</h3>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-sm text-white/40 mb-1">Plan</p>
                                    <p className="text-xl font-bold text-primary">{user.membership.planType} Plan</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-sm text-white/40 mb-1">Status</p>
                                    <p className={`text-xl font-bold ${user.membership.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {user.membership.status}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-white/60 block mb-2">Custom Days Added</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            value={customDays}
                                            onChange={(e) => setCustomDays(parseInt(e.target.value) || 0)}
                                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white w-24 focus:outline-none focus:border-primary"
                                        />
                                        <span className="text-white/40 text-sm">
                                            Total: {user.membership.totalDays + customDays - (user.membership.customDaysAdded || 0)} days
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-white/60 block mb-2">Custom Destinations</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                        {destinations.map(dest => (
                                            <button
                                                key={dest.id}
                                                onClick={() => toggleDestination(dest.id)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${selectedDestinations.includes(dest.id)
                                                        ? 'bg-primary/20 text-primary border border-primary/30'
                                                        : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selectedDestinations.includes(dest.id) ? 'border-primary bg-primary' : 'border-white/30'
                                                    }`}>
                                                    {selectedDestinations.includes(dest.id) && <Check size={10} className="text-white" />}
                                                </div>
                                                <span className="truncate">{dest.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full py-3 bg-primary rounded-xl font-bold text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </GlassCard>
                    ) : (
                        <GlassCard className="flex items-center justify-center py-16">
                            <p className="text-white/40">No membership</p>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
}
