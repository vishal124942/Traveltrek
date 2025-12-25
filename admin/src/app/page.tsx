'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if already logged in
        const token = adminApi.getToken();
        if (token) {
            router.push('/dashboard');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const response = await adminApi.login(email, password);

        if (response.success) {
            router.push('/dashboard');
        } else {
            setError(response.error || 'Login failed');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚙️</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">TravelTrek Admin</h1>
                    <p className="text-gray-500 mt-1">Sign in to manage your platform</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                            placeholder="admin@traveltrek.com"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full gradient-primary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-500 text-sm">
                    Only admins with ADMIN, OPS, or SUPPORT roles can access this panel.
                </p>
            </div>
        </div>
    );
}
