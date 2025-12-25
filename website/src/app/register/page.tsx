'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.register(name, email, phone, password);
            if (response.success) {
                // Auto login after registration
                const loginResponse = await api.login(email, password);
                if (loginResponse.success) {
                    router.push('/dashboard');
                } else {
                    router.push('/login');
                }
            } else {
                setError(response.error || 'Registration failed');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
            <div className="w-full max-w-md px-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✨</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Join TravelTrek</h1>
                    <p className="text-[var(--text-secondary)]">Start your journey beyond boundaries</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 card-shadow">
                    {error && (
                        <div className="bg-red-50 text-[var(--error)] px-4 py-3 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
                            placeholder="+91 98765 43210"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
                            placeholder="••••••••"
                            minLength={6}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center mt-6 text-[var(--text-secondary)]">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
