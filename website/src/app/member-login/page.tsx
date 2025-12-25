'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type PageState = 'login' | 'set-password' | 'forgot-password' | 'reset-password';

export default function MemberLoginPage() {
    const router = useRouter();
    const [pageState, setPageState] = useState<PageState>('login');
    const [membershipId, setMembershipId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Validate membership ID (and check if password setup needed)
    const handleMembershipIdSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/member-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ membershipId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid membership ID');
            }

            if (data.needsPasswordSetup) {
                // First time login - need to set password
                setEmail(data.email);
                setPageState('set-password');
                toast.info('Please set your password to continue');
            } else {
                // Password already set - this shouldn't happen since we didn't send password
                // This means the API expects password, so show login with password field
                setPageState('login');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to validate membership ID');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Login with password (for returning users)
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/member-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ membershipId, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (data.needsPasswordSetup) {
                setEmail(data.email);
                setPageState('set-password');
                toast.info('Please set your password first');
                return;
            }

            localStorage.setItem('auth_token', data.token);
            toast.success('Login successful!');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Set password for first-time users
    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/set-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ membershipId, email, password, confirmPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to set password');
            }

            localStorage.setItem('auth_token', data.token);
            toast.success('Password set successfully!');
            router.push('/dashboard');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to set password');
        } finally {
            setLoading(false);
        }
    };

    // Forgot password - request OTP
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            toast.success('OTP sent to your email!');
            setPageState('reset-password');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Reset password with OTP
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword: password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            toast.success('Password reset successfully! Please login.');
            setPassword('');
            setConfirmPassword('');
            setOtp('');
            setPageState('login');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-12 flex items-center justify-center">
            <div className="w-full max-w-md mx-auto px-5">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
                    {/* Login State */}
                    {pageState === 'login' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🔐</span>
                                </div>
                                <h1 className="text-2xl font-bold text-[#1A202C]">Member Login</h1>
                                <p className="text-[#718096] mt-2">Enter your Membership ID to continue</p>
                            </div>

                            <form onSubmit={password ? handleLogin : handleMembershipIdSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-[#1A202C] mb-2">Membership ID</label>
                                    <input
                                        type="text"
                                        value={membershipId}
                                        onChange={(e) => setMembershipId(e.target.value.toUpperCase())}
                                        placeholder="Enter your 10-digit Membership ID"
                                        className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-200 focus:border-[#667EEA] focus:ring-2 focus:ring-[#667EEA]/20 outline-none transition-all"
                                        required
                                    />
                                </div>

                                {membershipId && (
                                    <div>
                                        <label className="block text-sm font-medium text-[#1A202C] mb-2">Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-200 focus:border-[#667EEA] focus:ring-2 focus:ring-[#667EEA]/20 outline-none transition-all"
                                        />
                                        <p className="text-xs text-[#718096] mt-1">Leave blank if this is your first login</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full gradient-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {loading ? 'Please wait...' : password ? 'Login' : 'Continue'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setPageState('forgot-password')}
                                    className="text-[#667EEA] text-sm font-medium hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-sm text-[#718096]">
                                    Don&apos;t have a membership?{' '}
                                    <Link href="/join" className="text-[#667EEA] font-semibold hover:underline">
                                        Join Now
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}

                    {/* Set Password State (First time login) */}
                    {pageState === 'set-password' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🔑</span>
                                </div>
                                <h1 className="text-2xl font-bold text-[#1A202C]">Create Password</h1>
                                <p className="text-[#718096] mt-2">Set a password for your account</p>
                            </div>

                            <form onSubmit={handleSetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-[#1A202C] mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#1A202C] mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create a password (min 6 characters)"
                                        className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-200 focus:border-[#667EEA] focus:ring-2 focus:ring-[#667EEA]/20 outline-none transition-all"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#1A202C] mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your password"
                                        className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-200 focus:border-[#667EEA] focus:ring-2 focus:ring-[#667EEA]/20 outline-none transition-all"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full gradient-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {loading ? 'Setting Password...' : 'Set Password & Login'}
                                </button>
                            </form>

                            <button
                                onClick={() => { setPageState('login'); setPassword(''); setConfirmPassword(''); }}
                                className="w-full mt-4 text-[#718096] font-medium py-2 hover:text-[#1A202C] transition"
                            >
                                ← Back to Login
                            </button>
                        </>
                    )}

                    {/* Forgot Password State */}
                    {pageState === 'forgot-password' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">📧</span>
                                </div>
                                <h1 className="text-2xl font-bold text-[#1A202C]">Forgot Password</h1>
                                <p className="text-[#718096] mt-2">Enter your email to receive an OTP</p>
                            </div>

                            <form onSubmit={handleForgotPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-[#1A202C] mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your registered email"
                                        className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-200 focus:border-[#667EEA] focus:ring-2 focus:ring-[#667EEA]/20 outline-none transition-all"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full gradient-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </form>

                            <button
                                onClick={() => setPageState('login')}
                                className="w-full mt-4 text-[#718096] font-medium py-2 hover:text-[#1A202C] transition"
                            >
                                ← Back to Login
                            </button>
                        </>
                    )}

                    {/* Reset Password State */}
                    {pageState === 'reset-password' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🔐</span>
                                </div>
                                <h1 className="text-2xl font-bold text-[#1A202C]">Reset Password</h1>
                                <p className="text-[#718096] mt-2">Enter the OTP sent to your email</p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-[#1A202C] mb-2">OTP</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter 6-digit OTP"
                                        className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-200 focus:border-[#667EEA] focus:ring-2 focus:ring-[#667EEA]/20 outline-none transition-all"
                                        required
                                        maxLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#1A202C] mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create new password (min 6 characters)"
                                        className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-200 focus:border-[#667EEA] focus:ring-2 focus:ring-[#667EEA]/20 outline-none transition-all"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#1A202C] mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-200 focus:border-[#667EEA] focus:ring-2 focus:ring-[#667EEA]/20 outline-none transition-all"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full gradient-primary text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {loading ? 'Resetting Password...' : 'Reset Password'}
                                </button>
                            </form>

                            <button
                                onClick={() => { setPageState('forgot-password'); setOtp(''); setPassword(''); setConfirmPassword(''); }}
                                className="w-full mt-4 text-[#718096] font-medium py-2 hover:text-[#1A202C] transition"
                            >
                                ← Back
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
