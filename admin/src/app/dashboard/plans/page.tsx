'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard';
import { Edit2, Check, X, MapPin, Calendar, CreditCard } from 'lucide-react';

interface Destination {
    id: string;
    name: string;
}

interface Plan {
    id: string;
    planType: string;
    name: string;
    description?: string;
    days: number;
    price: number;
    isActive: boolean;
    destinations?: Destination[];
    destinationIds?: string[];
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Plan>>({});

    const fetchData = async () => {
        setLoading(true);
        const [plansRes, destRes] = await Promise.all([
            adminApi.getPlans(),
            adminApi.getDestinations()
        ]);

        if (plansRes.success && plansRes.data) {
            setPlans((plansRes.data as { plans: Plan[] }).plans);
        }
        if (destRes.success && destRes.data) {
            setDestinations((destRes.data as { destinations: Destination[] }).destinations);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const startEdit = (plan: Plan) => {
        setEditing(plan.id);
        setEditData({
            name: plan.name,
            description: plan.description,
            days: plan.days,
            price: plan.price,
            destinationIds: plan.destinations?.map(d => d.id) || []
        });
    };

    const saveEdit = async (id: string) => {
        const response = await adminApi.updatePlan(id, editData);
        if (response.success) {
            setEditing(null);
            fetchData();
        } else {
            alert(response.error || 'Failed to save');
        }
    };

    const toggleDestination = (destId: string) => {
        const currentIds = editData.destinationIds || [];
        if (currentIds.includes(destId)) {
            setEditData({ ...editData, destinationIds: currentIds.filter(id => id !== destId) });
        } else {
            setEditData({ ...editData, destinationIds: [...currentIds, destId] });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Membership Plans</h1>

            <div className="grid lg:grid-cols-2 gap-6">
                {plans.map((plan) => (
                    <GlassCard key={plan.id}>
                        {editing === plan.id ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white">Editing {plan.planType}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => saveEdit(plan.id)} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={() => setEditing(null)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-white/60 block mb-1">Plan Name</label>
                                    <input
                                        type="text"
                                        value={editData.name || ''}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-white/60 block mb-1">Description</label>
                                    <textarea
                                        value={editData.description || ''}
                                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary h-20 resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-white/60 block mb-1">Days</label>
                                        <input
                                            type="number"
                                            value={editData.days || 0}
                                            onChange={(e) => setEditData({ ...editData, days: parseInt(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-white/60 block mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            value={editData.price || 0}
                                            onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-white/60 block mb-2">Included Destinations</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                        {destinations.map(dest => (
                                            <button
                                                key={dest.id}
                                                onClick={() => toggleDestination(dest.id)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${(editData.destinationIds || []).includes(dest.id)
                                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                                    : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className={`w-3 h-3 rounded border ${(editData.destinationIds || []).includes(dest.id) ? 'border-primary bg-primary' : 'border-white/30'}`}>
                                                    {(editData.destinationIds || []).includes(dest.id) && <Check size={8} className="text-white" />}
                                                </div>
                                                <span className="truncate">{dest.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${plan.planType === '3Y'
                                            ? 'bg-primary/10 text-primary border-primary/20'
                                            : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                            }`}>
                                            {plan.planType} PLAN
                                        </span>
                                        <h2 className="text-xl font-bold text-white mt-2">{plan.name}</h2>
                                        <p className="text-white/40 text-sm mt-1">{plan.description || 'No description'}</p>
                                    </div>
                                    <button
                                        onClick={() => startEdit(plan)}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <div className="flex items-center gap-2 text-white/40 mb-1">
                                            <Calendar size={14} />
                                            <span className="text-xs">Duration</span>
                                        </div>
                                        <p className="text-xl font-bold text-white">{plan.days} <span className="text-sm font-normal text-white/40">Days</span></p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <div className="flex items-center gap-2 text-white/40 mb-1">
                                            <CreditCard size={14} />
                                            <span className="text-xs">Price</span>
                                        </div>
                                        <p className="text-xl font-bold text-emerald-400">₹{plan.price.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-white/40 mb-2">
                                        <MapPin size={14} />
                                        <span className="text-xs">Included Destinations ({plan.destinations?.length || 0})</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {plan.destinations && plan.destinations.length > 0 ? (
                                            plan.destinations.slice(0, 4).map(dest => (
                                                <span key={dest.id} className="px-2 py-1 bg-white/5 rounded-full text-xs text-white/60">
                                                    {dest.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-white/30 text-sm">No destinations</span>
                                        )}
                                        {plan.destinations && plan.destinations.length > 4 && (
                                            <span className="px-2 py-1 bg-white/5 rounded-full text-xs text-white/60">
                                                +{plan.destinations.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
