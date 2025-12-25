'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Destination {
  id: string;
  name: string;
  imageUrl?: string;
  durationDays: number;
  difficulty: string;
}

// Fallback destination images
const destinationImages: Record<string, string> = {
  'kashmir': '/images/destinations/kashmir.png',
  'ladakh': '/images/destinations/ladakh.png',
  'himachal': '/images/destinations/himachal.png',
  'himachal pradesh': '/images/destinations/himachal.png',
  'manali': '/images/destinations/himachal.png',
  'shimla': '/images/destinations/himachal.png',
  'rajasthan': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=300&fit=crop',
  'jaipur': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=300&fit=crop',
  'kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop',
  'goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop',
  'uttarakhand': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=300&fit=crop',
  'rishikesh': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=300&fit=crop',
  'andaman': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
};

const getDestinationImage = (name: string): string => {
  const normalizedName = name.toLowerCase();
  for (const [key, url] of Object.entries(destinationImages)) {
    if (normalizedName.includes(key)) {
      return url;
    }
  }
  return 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop';
};

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsLoggedIn(!!token);

    // Fetch destinations
    api.getDestinations().then((res) => {
      if (res.success && res.data?.destinations) {
        setDestinations((res.data.destinations as Destination[]).slice(0, 4));
      }
    });

    // If logged in, get user name
    if (token) {
      api.getProfile().then((res) => {
        if (res.success && res.data) {
          setUserName((res.data as { name: string }).name || '');
        }
      });
    }
  }, []);

  const difficultyColors: Record<string, string> = {
    easy: 'bg-[#48BB78]/10 text-[#48BB78]',
    moderate: 'bg-[#ED8936]/10 text-[#ED8936]',
    difficult: 'bg-[#F56565]/10 text-[#F56565]',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/about_us_hero.png"
          alt="Be the Globetrotter"
          fill
          className="object-cover brightness-[0.6]"
          priority
        />
        <div className="relative z-10 text-center text-white px-5 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl">Be The Globetrotter</h1>
          <p className="text-xl md:text-2xl mb-10 font-medium drop-shadow-lg leading-relaxed">
            Fill your soul with adventure. Immerse in the oriental pearl with its amazing beaches,
            temples and shrines fused with hi-tech cities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/join" className="gradient-primary text-white font-bold px-10 py-4 rounded-xl hover:opacity-90 transition shadow-xl">
              Join Membership
            </Link>
            <Link href="/destinations" className="bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold px-10 py-4 rounded-xl hover:bg-white/20 transition">
              Explore Destinations
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 py-16">
        {/* Experience Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-4xl font-bold text-[#1A202C] mb-6 leading-tight">Experience New Things!</h2>
            <p className="text-[#718096] text-lg leading-relaxed mb-8">
              Club TravelTrek is all about fun and that is what makes us a trusted holiday brand.
              We are trusted by families all round the globe to create precious holiday experiences that last a lifetime.
            </p>
            <Link href="/about" className="text-[#667EEA] font-bold flex items-center gap-2 hover:gap-3 transition-all">
              Learn more about our mission <span className="text-xl">→</span>
            </Link>
          </div>
          <div className="relative h-80 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <Image
              src="/blog_india.png"
              alt="Experience India"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Welcome Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1A202C] mb-1">
              {isLoggedIn ? `Welcome ${userName.split(' ')[0]} 👋` : 'Welcome to TravelTrek 👋'}
            </h1>
            <p className="text-sm text-[#718096]">
              Ready for your next adventure?
            </p>
          </div>
          {isLoggedIn ? (
            <Link href="/dashboard" className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg">
              {userName[0]?.toUpperCase() || 'U'}
            </Link>
          ) : (
            <Link href="/member-login" className="text-[#667EEA] font-bold hover:text-[#764BA2] transition-colors">
              Member Login
            </Link>
          )}
        </div>

        {/* Featured Destinations */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#1A202C]">Featured Destinations</h2>
          <Link href="/destinations" className="text-[#667EEA] text-sm font-medium">See All</Link>
        </div>

        {/* Horizontal Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide mb-8">
          {destinations.length > 0 ? destinations.map((dest) => (
            <div
              key={dest.id}
              className="flex-shrink-0 w-48 bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="h-32 relative">
                <Image
                  src={getDestinationImage(dest.name)}
                  alt={dest.name}
                  fill
                  className="object-cover"
                  unoptimized={getDestinationImage(dest.name).startsWith('http')}
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-[#1A202C] truncate">{dest.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-[#A0AEC0] flex items-center gap-1">
                    ⏱️ {dest.durationDays} days
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${difficultyColors[dest.difficulty] || difficultyColors.easy}`}>
                    {dest.difficulty?.charAt(0).toUpperCase() + dest.difficulty?.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )) : (
            // Placeholder cards with images
            [
              { name: 'Kashmir', image: '/images/destinations/kashmir.png' },
              { name: 'Ladakh', image: '/images/destinations/ladakh.png' },
              { name: 'Himachal', image: '/images/destinations/himachal.png' },
            ].map((dest, i) => (
              <div key={i} className="flex-shrink-0 w-48 bg-white rounded-2xl overflow-hidden shadow-md">
                <div className="h-32 relative">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-[#1A202C]">{dest.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[#A0AEC0]">⏱️ — days</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>


        {/* Quick Actions - matches mobile */}
        <h2 className="text-lg font-bold text-[#1A202C] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/chat" className="bg-[#667EEA]/10 rounded-2xl p-5 flex items-center gap-3 hover:bg-[#667EEA]/15 transition">
            <div className="w-11 h-11 rounded-xl bg-[#667EEA]/10 flex items-center justify-center">
              <span className="text-[#667EEA] text-xl">💬</span>
            </div>
            <span className="text-sm font-semibold text-[#667EEA]">AI Assistant</span>
          </Link>
          <a href="mailto:support@traveltrek.com" className="bg-[#764BA2]/10 rounded-2xl p-5 flex items-center gap-3 hover:bg-[#764BA2]/15 transition">
            <div className="w-11 h-11 rounded-xl bg-[#764BA2]/10 flex items-center justify-center">
              <span className="text-[#764BA2] text-xl">🎧</span>
            </div>
            <span className="text-sm font-semibold text-[#764BA2]">Support</span>
          </a>
        </div>

        {/* Membership Plans Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#1A202C] mb-8">Membership Plans</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* 1-Year Plan */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
              <h3 className="font-bold text-[#1A202C] text-xl mb-2">1-Year Membership</h3>
              <p className="text-3xl font-bold text-[#667EEA] mb-6">6 <span className="text-sm font-normal text-[#718096]">travel days</span></p>
              <ul className="space-y-3 text-sm text-[#718096] mb-8">
                <li className="flex items-center gap-2"><span className="text-[#48BB78]">✓</span> All destinations</li>
                <li className="flex items-center gap-2"><span className="text-[#48BB78]">✓</span> AI assistant</li>
                <li className="flex items-center gap-2"><span className="text-[#48BB78]">✓</span> 24/7 support</li>
              </ul>
              <Link href="/join" className="block w-full border-2 border-[#667EEA] text-[#667EEA] font-bold py-3 rounded-xl text-center hover:bg-[#667EEA] hover:text-white transition">
                Get Started
              </Link>
            </div>

            {/* 3-Year Plan */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
              <h3 className="font-bold text-[#1A202C] text-xl mb-2">3-Year Membership</h3>
              <p className="text-3xl font-bold text-[#667EEA] mb-6">18 <span className="text-sm font-normal text-[#718096]">travel days</span></p>
              <ul className="space-y-3 text-sm text-[#718096] mb-8">
                <li className="flex items-center gap-2"><span className="text-[#48BB78]">✓</span> Everything in 1-Year</li>
                <li className="flex items-center gap-2"><span className="text-[#48BB78]">✓</span> Priority booking</li>
                <li className="flex items-center gap-2"><span className="text-[#48BB78]">✓</span> Travel insurance</li>
              </ul>
              <Link href="/join" className="block w-full border-2 border-[#667EEA] text-[#667EEA] font-bold py-3 rounded-xl text-center hover:bg-[#667EEA] hover:text-white transition">
                Get Started
              </Link>
            </div>

            {/* 5-Year Plan */}
            <div className="gradient-primary rounded-3xl p-8 shadow-xl relative overflow-hidden transform hover:-translate-y-1 transition-transform">
              <span className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full">BEST VALUE</span>
              <h3 className="font-bold text-white text-xl mb-2">5-Year Membership</h3>
              <p className="text-3xl font-bold text-white mb-6">30 <span className="text-sm font-normal text-white/70">travel days</span></p>
              <ul className="space-y-3 text-sm text-white/80 mb-8">
                <li className="flex items-center gap-2">✓ Everything in 3-Year</li>
                <li className="flex items-center gap-2">✓ VIP Concierge</li>
                <li className="flex items-center gap-2">✓ Exclusive Lounge Access</li>
              </ul>
              <Link href="/join" className="block w-full bg-white text-[#667EEA] font-bold py-3 rounded-xl text-center hover:bg-white/90 transition">
                Get Premium
              </Link>
            </div>
          </div>
        </div>

        {/* Member Reviews Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#1A202C] mb-4">What Our Members Say</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Rajesh & Sunita Sharma',
                location: 'Mumbai',
                initials: 'RS',
                color: 'from-[#667EEA] to-[#764BA2]',
                testimonial: 'Our Kashmir trip was beyond expectations! TravelTrek arranged everything perfectly - from the houseboat stay on Dal Lake to the Gondola ride in Gulmarg.',
                destination: 'Kashmir',
                tripType: 'Anniversary Trip',
              },
              {
                name: 'Priya & Vikram Menon',
                location: 'Bangalore',
                initials: 'PM',
                color: 'from-[#F56565] to-[#ED8936]',
                testimonial: 'The Ladakh bike expedition was the adventure of a lifetime! TravelTrek handled all permits, oxygen support, and backup vehicles.',
                destination: 'Ladakh',
                tripType: 'Adventure Trip',
              },
              {
                name: 'The Gupta Family',
                location: 'Delhi',
                initials: 'GF',
                color: 'from-[#48BB78] to-[#38B2AC]',
                testimonial: 'Traveled with our kids to Himachal. TravelTrek created a perfect family itinerary with snow activities and kid-friendly hotels.',
                destination: 'Himachal Pradesh',
                tripType: 'Family Vacation',
              },
              {
                name: 'Arjun Patel',
                location: 'Ahmedabad',
                initials: 'AP',
                color: 'from-[#9F7AEA] to-[#667EEA]',
                testimonial: 'The Rajasthan heritage tour exceeded my expectations. Visited Jaipur, Udaipur, and Jaisalmer with authentic local experiences - folk music, desert camping, palace stays.',
                destination: 'Rajasthan',
                tripType: 'Heritage Tour',
              },
              {
                name: 'Meera Krishnan',
                location: 'Chennai',
                initials: 'MK',
                color: 'from-[#ED8936] to-[#F56565]',
                testimonial: 'The Kerala backwaters houseboat experience was pure bliss. TravelTrek arranged an Ayurvedic spa package and the seafood was incredible!',
                destination: 'Kerala',
                tripType: 'Wellness Retreat',
              },
              {
                name: 'Sameer & Neha Joshi',
                location: 'Pune',
                initials: 'SJ',
                color: 'from-[#4299E1] to-[#667EEA]',
                testimonial: 'Our Goa trip was perfectly balanced - beach time, water sports, and nightlife. TravelTrek got us the best beachfront property!',
                destination: 'Goa',
                tripType: 'Beach Getaway',
              },
            ].map((review, index) => (
              <div key={index} className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${review.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {review.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1A202C] text-sm truncate">{review.name}</h3>
                    <p className="text-xs text-[#A0AEC0]">{review.location}</p>
                  </div>
                </div>
                <span className="inline-block text-[10px] bg-[#667EEA]/10 text-[#667EEA] px-2 py-0.5 rounded-full font-medium mb-2">
                  {review.tripType}
                </span>
                <p className="text-sm text-[#718096] leading-relaxed line-clamp-3">
                  &ldquo;{review.testimonial}&rdquo;
                </p>
                <p className="text-xs text-[#A0AEC0] mt-2">
                  📍 Traveled to <span className="text-[#667EEA] font-medium">{review.destination}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-[#764BA2]/10 border border-[#764BA2]/30 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#764BA2]/10 flex items-center justify-center">
            <span className="text-2xl">🎧</span>
          </div>
          <div>
            <h3 className="font-semibold text-[#1A202C] text-sm">Need help with your membership?</h3>
            <p className="text-xs text-[#718096]">Contact: support@traveltrek.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
