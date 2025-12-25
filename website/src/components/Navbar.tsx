'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        const token = localStorage.getItem('auth_token');
        setIsLoggedIn(!!token);

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About Us' },
        { href: '/destinations', label: 'Destinations' },
        { href: '/join', label: 'Membership' },
        { href: '/blog', label: 'Blog' },
    ];

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-[#F8FAFC] py-4'
                    }`}
            >
                <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                            <span className="text-white text-lg">✈️</span>
                        </div>
                        <span className="font-bold text-lg text-[#1A202C]">
                            TravelTrek
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-[#718096] hover:text-[#667EEA] transition-colors font-medium"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        {isLoggedIn ? (
                            <Link href="/dashboard" className="gradient-primary text-white text-sm font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/member-login" className="text-sm text-[#667EEA] hover:text-[#764BA2] transition-colors font-semibold">
                                    Member Login
                                </Link>
                                <Link href="/join" className="gradient-primary text-white text-sm font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition">
                                    Join Now
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-[#1A202C]"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile Side Panel Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[60] md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Side Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-[280px] bg-white z-[70] transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Close Button */}
                <div className="flex items-center justify-between p-5 border-b">
                    <span className="font-bold text-lg text-[#1A202C]">Menu</span>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-[#718096] hover:text-[#1A202C]"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col p-5">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-[#1A202C] font-medium py-3 border-b border-gray-100 hover:text-[#667EEA] transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="p-5 mt-auto">
                    {isLoggedIn ? (
                        <Link
                            href="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block gradient-primary text-white font-semibold py-3 rounded-xl text-center"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/member-login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-[#667EEA] font-semibold py-3 text-center border border-[#667EEA] rounded-xl hover:bg-[#667EEA]/5 transition-colors"
                            >
                                Member Login
                            </Link>
                            <Link
                                href="/join"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="gradient-primary text-white font-semibold py-3 rounded-xl text-center"
                            >
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>
            </div >
        </>
    );
}
