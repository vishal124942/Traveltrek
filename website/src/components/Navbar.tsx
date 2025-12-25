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

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About Us' },
        { href: '/destinations', label: 'Destinations' },
        { href: '/join', label: 'Membership' },
        { href: '/blog', label: 'Blog' },
    ];

    return (
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
                    {isLoggedIn && (
                        <Link href="/chat" className="text-sm text-[#718096] hover:text-[#667EEA] transition-colors font-medium">
                            AI Chat
                        </Link>
                    )}
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
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white shadow-lg mx-4 mt-2 rounded-xl p-4">
                    <div className="flex flex-col gap-3">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="text-[#1A202C] font-medium py-2">
                                {link.label}
                            </Link>
                        ))}
                        {isLoggedIn && <Link href="/chat" className="text-[#1A202C] font-medium py-2">AI Chat</Link>}
                        <hr className="border-gray-100 my-2" />
                        {isLoggedIn ? (
                            <Link href="/dashboard" className="gradient-primary text-white font-semibold py-3 rounded-xl text-center">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/member-login" className="text-[#667EEA] font-semibold py-2 text-center">
                                    Member Login
                                </Link>
                                <Link href="/join" className="gradient-primary text-white font-semibold py-3 rounded-xl text-center">
                                    Join Now
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
