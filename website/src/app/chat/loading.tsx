export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#667EEA] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/60">Loading chat...</p>
            </div>
        </div>
    );
}
