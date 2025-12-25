'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MemberLoginPage() {
    const router = useRouter();
    const [membershipId, setMembershipId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // TODO: Replace with actual member login API
            const response = await fetch('http://localhost:3000/api/auth/member-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ membershipId, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token and redirect
            localStorage.setItem('auth_token', data.token);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-12 flex items-center justify-center">
            <div className="w-full max-w-md mx-auto px-5">
                {/* Card */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🔐</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[#1A202C] mb-2">Member Login</h1>
                        <p className="text-[#718096] text-sm">
                            Enter your Membership ID to access your account
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[#1A202C] mb-2">
                                Membership ID
                            </label>
                            <input
                                type="text"
                                value={membershipId}
                                onChange={(e) => setMembershipId(e.target.value.toUpperCase())}
                                placeholder="e.g., TT-2024-00001"
                                className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:border-[#667EEA] focus:ring-4 focus:ring-[#667EEA]/10 outline-none transition-all text-center font-mono text-xl tracking-widest bg-gray-50/50"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#1A202C] mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:border-[#667EEA] focus:ring-4 focus:ring-[#667EEA]/10 outline-none transition-all bg-gray-50/50"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !membershipId || !password}
                            className="w-full gradient-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-[#718096]">
                            Don&apos;t have a membership?{' '}
                            <Link href="/join" className="text-[#667EEA] font-semibold hover:underline">
                                Join Now
                            </Link>
                        </p>
                    </div>

                    {/* Help */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-xs text-center text-[#A0AEC0]">
                            Your Membership ID was sent to you via email after your membership was approved.{' '}
                            <a href="mailto:support@traveltrek.com" className="text-[#667EEA] hover:underline">
                                Contact Support
                            </a>
                        </p>
                    </div>
                </div>

                {/* Alternative Login */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-[#718096]">
                        Staff member?{' '}
                        <Link href="/login" className="text-[#667EEA] font-medium hover:underline">
                            Login with Email
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
