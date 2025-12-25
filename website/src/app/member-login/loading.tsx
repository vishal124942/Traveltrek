export default function Loading() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-24 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#667EEA] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#718096]">Loading...</p>
            </div>
        </div>
    );
}
