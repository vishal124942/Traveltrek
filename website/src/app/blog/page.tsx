import Image from 'next/image';
import Link from 'next/link';

const blogPosts = [
    {
        id: 'incredible-india',
        title: 'Incredible India: A Journey Through Time',
        excerpt: 'Discover the diverse culture, rich history, and stunning landscapes that make India a truly incredible destination.',
        content: '"Incredible India" is the slogan used by the Indian government to promote tourism in India. It reflects the diverse culture, rich history, stunning landscapes, and a wide array of experiences that India has to offer. India is known for its iconic landmarks like the Taj Mahal, cultural heritage, festivals, and the warmth of its people. It\'s a country that combines ancient traditions with modern development, making it a truly incredible destination for travelers.',
        image: '/blog_india.png',
        category: 'Destinations',
        date: 'Dec 20, 2024'
    },
    {
        id: 'scenic-snow-peaks',
        title: 'Scenic: Snow Peaks & Hill Stations',
        excerpt: 'When snow falls nature listens. Experience the magic of the Himalayas in winter.',
        content: 'When snow falls nature listens. A visit in January might even let you enjoy fluffy white snow. Build a snowman, run about, launch a snow ball fight or simply roll about in it. You can even go rappelling down the snow covered rocks. Lose yourself in the magnificent view and go WOW! Mountains are the beginnings and end of all natural scenery. Wake up to spectacular hill sights and fresh pine scented air. To immerse in the surroundings, try trekking in Himalayas.',
        image: '/blog_snow.png',
        category: 'Adventure',
        date: 'Dec 15, 2024'
    },
    {
        id: 'travel-tips-experts',
        title: 'Travel Tips - From Travel Experts',
        excerpt: 'Essential tips for traveling in India during Monsoon, Summer, and Winter.',
        content: 'Monsoon: Carry extra clothes, footwear, water proof floaters/shoes. Rain coats and umbrellas are a must. Be safe – take medicines for cough and cold and indigestion. Summer: Have plenty of fluids, carry soluble electrolytes drinks. Avoid direct sunlight for long hours. Seek the shade wherever possible. Winter: Carry woolens more than you think you will need. It is essential to keep your head covered while going outside. Wear shoes with good grip and carry extra – playing in snow makes shoes wet.',
        image: '/blog_tips.png',
        category: 'Travel Tips',
        date: 'Dec 10, 2024'
    }
];

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-5">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#1A202C] mb-4">TravelTrek Blog</h1>
                    <p className="text-[#718096] text-lg max-w-2xl mx-auto">
                        Insights, stories, and expert tips to help you plan your next unforgettable journey.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <article key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <div className="relative h-64">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur-sm text-[#667EEA] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="text-sm text-[#718096] mb-3">{post.date}</div>
                                <h2 className="text-2xl font-bold text-[#1A202C] mb-4 leading-tight">
                                    {post.title}
                                </h2>
                                <p className="text-[#718096] mb-6 line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <button className="text-[#667EEA] font-bold hover:text-[#764BA2] transition-colors flex items-center gap-2">
                                    Read More
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Newsletter Section */}
                <div className="mt-20 bg-[#1A202C] rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#667EEA] opacity-10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#764BA2] opacity-10 rounded-full -ml-32 -mb-32"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Subscribe to our Newsletter</h2>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                            Get the latest travel stories and exclusive membership offers delivered straight to your inbox.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white outline-none focus:border-[#667EEA] transition-colors"
                                required
                            />
                            <button className="gradient-primary px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition shadow-lg">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
