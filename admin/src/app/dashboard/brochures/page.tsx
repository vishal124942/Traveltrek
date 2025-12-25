'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard';
import { FileText, Trash2, Upload, Plus, X, Download } from 'lucide-react';

interface Brochure {
    id: string;
    title: string;
    url: string;
    createdAt: string;
}

export default function BrochuresPage() {
    const [brochures, setBrochures] = useState<Brochure[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const fetchBrochures = async () => {
        setLoading(true);
        const response = await adminApi.getBrochures();
        if (response.success && response.data) {
            setBrochures((response.data as { brochures: Brochure[] }).brochures);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBrochures();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) {
            alert('Please provide both title and PDF file');
            return;
        }

        setUploading(true);

        // Step 1: Upload the file
        const uploadRes = await adminApi.uploadFile(file);
        if (!uploadRes.success || !uploadRes.data) {
            alert('Upload failed: ' + (uploadRes.error || 'Unknown error'));
            setUploading(false);
            return;
        }

        const fileUrl = (uploadRes.data as { url: string }).url;

        // Step 2: Create the brochure record
        const createRes = await adminApi.createBrochure(title, fileUrl);

        if (createRes.success) {
            setShowAdd(false);
            setTitle('');
            setFile(null);
            fetchBrochures();
        } else {
            alert('Create brochure failed: ' + (createRes.error || 'Unknown error'));
        }
        setUploading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete?')) return;
        const response = await adminApi.deleteBrochure(id);
        if (response.success) {
            fetchBrochures();
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Brochures</h1>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                    {showAdd ? <X size={18} /> : <Plus size={18} />}
                    {showAdd ? 'Cancel' : 'Add'}
                </button>
            </div>

            {showAdd && (
                <GlassCard>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="text-sm text-white/60 block mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Summer 2025 Catalog"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-white/60 block mb-1">PDF File</label>
                            <div className="relative border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    required
                                />
                                <Upload size={24} className="mx-auto text-white/40 mb-2" />
                                <span className="text-sm text-white/40">{file ? file.name : 'Upload PDF'}</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full py-3 bg-primary rounded-xl font-bold text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Upload Brochure'}
                        </button>
                    </form>
                </GlassCard>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brochures.map((brochure) => (
                    <GlassCard key={brochure.id}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                                <FileText size={20} />
                            </div>
                            <button
                                onClick={() => handleDelete(brochure.id)}
                                className="p-2 text-white/20 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <h3 className="font-bold text-white mb-1">{brochure.title}</h3>
                        <p className="text-xs text-white/40 mb-4">{new Date(brochure.createdAt).toLocaleDateString()}</p>

                        <a
                            href={brochure.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 text-sm transition-colors"
                        >
                            <Download size={14} />
                            Download
                        </a>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
