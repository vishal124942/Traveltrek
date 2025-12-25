export default function Loading() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header skeleton */}
                <div className="h-10 w-64 bg-gray-200 rounded-lg mb-8 animate-pulse"></div>

                {/* Grid skeleton */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                            <div className="h-48 bg-gray-200"></div>
                            <div className="p-5">
                                <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
