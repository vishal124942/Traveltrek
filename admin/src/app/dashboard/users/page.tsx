'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { Search, User, ChevronRight } from 'lucide-react';

interface UserData {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
    membership: {
        planType: string;
        status: string;
    } | null;
}

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function fetchUsers() {
            const response = await adminApi.getUsers();
            if (response.success && response.data) {
                setUsers((response.data as { users: UserData[] }).users);
            }
            setLoading(false);
        }
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    const roleColors: Record<string, string> = {
        ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        OPS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        SUPPORT: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        USER: 'bg-white/10 text-white/60 border-white/10',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Users</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-surface border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Membership</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    onClick={() => router.push(`/dashboard/users/${user.id}`)}
                                    className="hover:bg-white/5 cursor-pointer transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{user.name}</p>
                                                <p className="text-sm text-white/40">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white/60">{user.phone}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${roleColors[user.role]}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.membership ? (
                                            <span className={`text-sm ${user.membership.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {user.membership.planType === '1Y' ? '1-Year' : '3-Year'}
                                                <span className="text-white/40"> ({user.membership.status.toLowerCase()})</span>
                                            </span>
                                        ) : (
                                            <span className="text-white/30 text-sm">None</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white/40">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <ChevronRight size={18} className="text-white/20 group-hover:text-white/60 transition-colors" />
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
