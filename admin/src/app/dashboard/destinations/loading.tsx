export default function Loading() {
    return (
        <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/60">Loading destinations...</p>
            </div>
        </div>
    );
}
