'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Plan {
    id: string;
    planType: string;
    name: string;
    description?: string;
    days: number;
    price: number;
}

export default function JoinPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [step, setStep] = useState<'plan' | 'form' | 'success'>('plan');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
    });

    useEffect(() => {
        async function fetchPlans() {
            try {
                const response = await fetch('http://localhost:3000/api/membership/plans');
                const data = await response.json();
                if (data.plans) {
                    setPlans(data.plans);
                }
            } catch {
                // Use fallback plans
                setPlans([
                    { id: '1', planType: '1Y', name: '1-Year Membership', days: 6, price: 9999 },
                    { id: '2', planType: '3Y', name: '3-Year Membership', days: 18, price: 24999 },
                    { id: '3', planType: '5Y', name: '5-Year Membership', days: 30, price: 39999 },
                ]);
            }
        }
        fetchPlans();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/membership/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    planType: selectedPlan,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Enrollment failed');
            }

            setStep('success');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-5">
                {/* Progress */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    {['Select Plan', 'Your Details', 'Confirmation'].map((label, i) => (
                        <div key={label} className="flex items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${(step === 'plan' && i === 0) ||
                                    (step === 'form' && i <= 1) ||
                                    (step === 'success' && i <= 2)
                                    ? 'gradient-primary text-white'
                                    : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {i + 1}
                            </div>
                            <span className="text-sm text-[#718096] hidden sm:block">{label}</span>
                            {i < 2 && <div className="w-8 h-0.5 bg-gray-200 hidden sm:block"></div>}
                        </div>
                    ))}
                </div>

                {/* Step 1: Select Plan */}
                {step === 'plan' && (
                    <div>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-[#1A202C] mb-3">Choose Your Plan</h1>
                            <p className="text-[#718096]">Select the membership that fits your travel style</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            {plans.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan.planType)}
                                    className={`text-left p-6 rounded-2xl border-2 transition-all ${selectedPlan === plan.planType
                                        ? 'border-[#667EEA] bg-[#667EEA]/5 shadow-lg'
                                        : 'border-gray-200 bg-white hover:border-[#667EEA]/50'
                                        }`}
                                >
                                    {plan.planType === '5Y' && (
                                        <span className="inline-block bg-[#667EEA] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                                            BEST VALUE
                                        </span>
                                    )}
                                    <h3 className="text-lg font-bold text-[#1A202C] mb-2">{plan.name}</h3>
                                    <p className="text-2xl font-bold text-[#667EEA] mb-2">
                                        {plan.days} <span className="text-sm font-normal text-[#718096]">travel days</span>
                                    </p>
                                    {plan.description && (
                                        <p className="text-xs text-[#718096] mt-3">{plan.description}</p>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => selectedPlan && setStep('form')}
                            disabled={!selectedPlan}
                            className="w-full gradient-primary text-white font-semibold py-4 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Step 2: Form */}
                {step === 'form' && (
                    <div>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-[#1A202C] mb-3">Your Details</h1>
                            <p className="text-[#718096]">We&apos;ll send your Membership ID via email once approved</p>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-[#1A202C] mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#667EEA] focus:ring-2 focus:ring-[#667EEA]/20 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#1A202C] mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="your@email.com"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#667EEA] focus:ring-2 focus:ring-[#667EEA]/20 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#1A202C] mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#667EEA] focus:ring-2 focus:ring-[#667EEA]/20 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#1A202C] mb-2">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="e.g., Mumbai"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#667EEA] focus:ring-2 focus:ring-[#667EEA]/20 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#1A202C] mb-2">State</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        placeholder="e.g., Maharashtra"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#667EEA] focus:ring-2 focus:ring-[#667EEA]/20 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Selected Plan */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <p className="text-sm text-[#718096] mb-1">Selected Plan</p>
                                <p className="font-semibold text-[#1A202C]">
                                    {plans.find((p) => p.planType === selectedPlan)?.name} - {plans.find((p) => p.planType === selectedPlan)?.days} travel days
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep('plan')}
                                    className="flex-1 border-2 border-gray-200 text-[#718096] font-semibold py-4 rounded-xl hover:border-gray-300 transition"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 gradient-primary text-white font-semibold py-4 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Request'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 'success' && (
                    <div className="text-center">
                        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-lg mx-auto">
                            <div className="w-20 h-20 rounded-full bg-[#48BB78]/10 flex items-center justify-center mx-auto mb-6">
                                <span className="text-5xl">🎉</span>
                            </div>
                            <h1 className="text-2xl font-bold text-[#1A202C] mb-3">Request Submitted!</h1>
                            <p className="text-[#718096] mb-6">
                                Thank you for choosing TravelTrek! Our team will review your request and contact you within 24 hours.
                            </p>

                            <div className="bg-[#667EEA]/10 rounded-xl p-4 mb-6">
                                <p className="text-sm font-medium text-[#667EEA]">What happens next?</p>
                                <ol className="text-sm text-[#718096] text-left mt-2 space-y-2">
                                    <li>1. Our team reviews your request</li>
                                    <li>2. We contact you to confirm payment details</li>
                                    <li>3. Once confirmed, you receive your <strong>Membership ID via email</strong></li>
                                    <li>4. Login and start planning your trips!</li>
                                </ol>
                            </div>

                            <Link
                                href="/"
                                className="inline-block gradient-primary text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
