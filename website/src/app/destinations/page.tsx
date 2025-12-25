'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';

interface Destination {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    durationDays: number;
    difficulty: string;
    status: string;
    bestMonths: string[];
}

const difficultyColors: Record<string, string> = {
    easy: 'bg-[#48BB78]/10 text-[#48BB78]',
    moderate: 'bg-[#ED8936]/10 text-[#ED8936]',
    difficult: 'bg-[#F56565]/10 text-[#F56565]',
};

const statusColors: Record<string, string> = {
    available: 'bg-[#48BB78]',
    not_available: 'bg-[#A0AEC0]',
    coming_soon: 'bg-[#4299E1]',
};

const statusLabels: Record<string, string> = {
    available: 'Available',
    not_available: 'Not Available',
    coming_soon: 'Coming Soon',
};

// Fallback destination images
const destinationImages: Record<string, string> = {
    'kashmir': '/images/destinations/kashmir.png',
    'ladakh': '/images/destinations/ladakh.png',
    'himachal': '/images/destinations/himachal.png',
    'himachal pradesh': '/images/destinations/himachal.png',
    'manali': '/images/destinations/himachal.png',
    'shimla': '/images/destinations/himachal.png',
    'rajasthan': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&h=600&fit=crop',
    'jaipur': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&h=600&fit=crop',
    'kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop',
    'goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop',
    'uttarakhand': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&h=600&fit=crop',
    'rishikesh': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&h=600&fit=crop',
    'andaman': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    'meghalaya': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'sikkim': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop',
};

const getDestinationImage = (name: string): string => {
    const normalizedName = name.toLowerCase();
    for (const [key, url] of Object.entries(destinationImages)) {
        if (normalizedName.includes(key)) {
            return url;
        }
    }
    // Default fallback
    return 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop';
};

export default function DestinationsPage() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDestinations() {
            try {
                const response = await api.getDestinations();
                if (response.success && response.data?.destinations) {
                    setDestinations(response.data.destinations as Destination[]);
                } else {
                    setError(response.error || 'Failed to load destinations');
                }
            } catch {
                setError('Network error');
            } finally {
                setLoading(false);
            }
        }

        fetchDestinations();
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto px-5 mb-12 text-center">
                <h1 className="text-4xl font-bold text-[#1A202C] mb-4">Explore Destinations</h1>
                <p className="text-[#718096] text-lg max-w-2xl mx-auto">
                    Handpicked destinations curated for the ultimate travel experience.
                    From serene beaches to majestic mountains, find your next adventure.
                </p>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-5">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-[#667EEA] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-[#F56565] mb-4">{error}</p>
                        <button onClick={() => window.location.reload()} className="gradient-primary text-white px-6 py-2 rounded-xl">
                            Retry
                        </button>
                    </div>
                ) : destinations.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-6xl mb-4 block">🏔️</span>
                        <p className="text-[#718096]">No destinations available yet.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {destinations.map((destination) => (
                            <div
                                key={destination.id}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                            >
                                {/* Image with Status Badge */}
                                <div className="h-48 relative">
                                    <Image
                                        src={getDestinationImage(destination.name)}
                                        alt={destination.name}
                                        fill
                                        className="object-cover"
                                        unoptimized={getDestinationImage(destination.name).startsWith('http')}
                                    />
                                    <span className={`absolute top-4 right-4 ${statusColors[destination.status] || statusColors.available} text-white text-xs font-semibold px-3 py-1.5 rounded-full`}>
                                        {statusLabels[destination.status] || destination.status}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    {/* Name */}
                                    <h3 className="text-xl font-bold text-[#1A202C] mb-2">
                                        {destination.name}
                                    </h3>

                                    {destination.description && (
                                        <p className="text-sm text-[#718096] mb-4 line-clamp-2">
                                            {destination.description}
                                        </p>
                                    )}

                                    {/* Info chips */}
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className="flex items-center gap-1.5 text-sm bg-[#667EEA]/10 text-[#667EEA] px-3 py-1.5 rounded-full font-medium">
                                            ⏱️ {destination.durationDays} days
                                        </span>
                                        <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${difficultyColors[destination.difficulty] || difficultyColors.easy}`}>
                                            📈 {destination.difficulty?.charAt(0).toUpperCase() + destination.difficulty?.slice(1)}
                                        </span>
                                    </div>

                                    {/* Best months */}
                                    {destination.bestMonths && destination.bestMonths.length > 0 && (
                                        <div className="flex items-start gap-2">
                                            <span className="text-[#A0AEC0]">📅</span>
                                            <div>
                                                <p className="text-xs text-[#A0AEC0]">Best Months</p>
                                                <p className="text-sm text-[#1A202C] font-medium">
                                                    {destination.bestMonths.join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

