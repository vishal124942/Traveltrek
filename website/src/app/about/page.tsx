import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white pt-20">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <Image
                    src="/about_us_hero.png" // I will need to move the generated image to public folder or use the absolute path if possible. 
                    // For now, I'll assume I'll move it or use a placeholder if it's not accessible via /
                    alt="About TravelTrek"
                    fill
                    className="object-cover brightness-75"
                    priority
                />
                <div className="relative z-10 text-center text-white px-5">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">Experience New Things!</h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto font-medium drop-shadow-md">
                        Club TravelTrek is all about fun and that is what makes us a trusted holiday brand.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 px-5 max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-[#1A202C] mb-6">Our Mission</h2>
                        <p className="text-[#718096] text-lg leading-relaxed mb-6">
                            We are trusted by families all round the globe to create precious holiday experiences that last a lifetime.
                            We give you the chance to enjoy new experiences, discover the unusual and spend wonderful moments with those you love.
                        </p>
                        <p className="text-[#718096] text-lg leading-relaxed">
                            Whether it's a serene beach getaway, a thrilling mountain adventure, or a cultural immersion,
                            TravelTrek is dedicated to making every journey seamless and unforgettable.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-2xl font-bold text-[#1A202C] mb-4">Why Choose Us?</h3>
                        <ul className="space-y-4">
                            {[
                                "Ease of booking with expert guidance",
                                "No restriction of seasons for your travel",
                                "One-stop solutions for all holiday needs",
                                "Lavish breakfast buffets and premium stays",
                                "Assured bookings and 24/7 support"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-[#718096]">
                                    <div className="w-6 h-6 rounded-full bg-[#667EEA]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                        <span className="text-[#667EEA] text-xs">✓</span>
                                    </div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Corporate Section */}
            <section className="bg-[#F8FAFC] py-20 px-5">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-[#1A202C] mb-6">Corporate RENEW Advantage</h2>
                    <p className="text-[#718096] text-lg max-w-3xl mx-auto mb-12 leading-relaxed">
                        Let your employees make wonderful memories, not exhausting presentations!
                        Grab the RENEW advantage. It's the ideal opportunity for corporates to help their employees
                        leave those crazy schedules and haunting deadlines behind.
                    </p>
                    <div className="inline-block bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-xl font-bold text-[#1A202C] mb-2">Give your employees a chance to unwind with RENEW.</p>
                        <p className="text-[#667EEA] font-medium">Contact our corporate team for customized packages.</p>
                    </div>
                </div>
            </section>

            {/* Globetrotter Section */}
            <section className="py-20 px-5 max-w-6xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-[#1A202C] mb-8">Be The Globetrotter</h2>
                <p className="text-[#718096] text-lg max-w-4xl mx-auto leading-relaxed mb-12">
                    Fill your soul with adventure. Immerse in the oriental pearl with its amazing beaches, temples and shrines fused with hi-tech cities.
                    Get mesmerized in Europe in the alps, vineyards, castles, churches, sprawling cities and lakes.
                    Visit America and discover the new world with its awesome beauty and the promise it holds.
                    Explore the fauna of Africa. Go down under to Australia and discover magical beaches and drives, bustling city life and of course, the Great Barrier Reef!
                </p>
                <Link
                    href="/join"
                    className="inline-block gradient-primary text-white font-bold px-10 py-4 rounded-xl hover:opacity-90 transition shadow-lg"
                >
                    Start Your Journey Now
                </Link>
            </section>

            {/* Contact Info */}
            <section className="bg-[#1A202C] text-white py-16 px-5">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center md:text-left">
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Call Us</h4>
                        <p className="text-2xl font-bold">1800 XXX XXXX</p>
                        <p className="text-gray-400 mt-1">Toll Free Number</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Email Us</h4>
                        <p className="text-2xl font-bold">info@traveltrekholidays.com</p>
                        <p className="text-gray-400 mt-1">For general inquiries</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Support</h4>
                        <p className="text-2xl font-bold">support@traveltrek.com</p>
                        <p className="text-gray-400 mt-1">24/7 Customer Support</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
