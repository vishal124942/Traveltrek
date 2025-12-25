import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-[#F1F5F9] text-[#1A202C] py-16 border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Brand & Mission */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Making Holidaying Easy For You</h4>
                        <p className="text-[#718096] text-sm leading-relaxed mb-6">
                            Ease of booking. No restriction of seasons. One stop solutions for all your holidaying needs. Advise from our holiday experts. Lavish breakfast buffet.
                        </p>
                        <p className="font-bold text-lg">Our Toll Free No: 1800 121 2490</p>
                    </div>

                    {/* Sitemap */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Sitemap</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><Link href="/" className="hover:text-[#667EEA] transition">HOME</Link></li>
                            <li><Link href="/about" className="hover:text-[#667EEA] transition">ABOUT US</Link></li>
                            <li><Link href="/join" className="hover:text-[#667EEA] transition">MEMBERSHIPS</Link></li>
                            <li><Link href="/contact" className="hover:text-[#667EEA] transition">CONTACT US</Link></li>
                            <li><Link href="/plans" className="hover:text-[#667EEA] transition">PRICE LIST</Link></li>
                            <li className="flex items-center gap-2 text-[#667EEA]">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                ASSURED BOOKING
                            </li>
                        </ul>
                    </div>

                    {/* Important Links */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Important Links</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><Link href="/privacy" className="hover:text-[#667EEA] transition">PRIVACY POLICY</Link></li>
                            <li><Link href="/terms" className="hover:text-[#667EEA] transition">TERMS OF USE</Link></li>
                        </ul>
                    </div>
                </div>

                <hr className="border-gray-200 my-10" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#718096] font-medium">
                    <p>© 2024 TravelTrek. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
                            <span className="text-[10px] text-white">✈️</span>
                        </div>
                        <span className="font-bold text-[#1A202C]">TravelTrek</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
