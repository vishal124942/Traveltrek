'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard';
import { Trash2, Upload, Plus, X, Edit2, Image as ImageIcon } from 'lucide-react';

interface Destination {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
}

export default function DestinationsPage() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState<{ name: string; description: string; imageUrl: string }>({
        name: '',
        description: '',
        imageUrl: ''
    });
    const [file, setFile] = useState<File | null>(null);

    const fetchDestinations = async () => {
        setLoading(true);
        const response = await adminApi.getDestinations();
        if (response.success && response.data) {
            setDestinations((response.data as { destinations: Destination[] }).destinations);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDestinations();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', description: '', imageUrl: '' });
        setFile(null);
        setShowAdd(false);
        setEditing(null);
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        const response = await adminApi.uploadFile(file);
        setUploading(false);
        if (response.success && response.data) {
            return (response.data as { url: string }).url;
        }
        alert(response.error || 'Upload failed');
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let imageUrl = formData.imageUrl;
        if (file) {
            const uploadedUrl = await handleUpload(file);
            if (!uploadedUrl) return;
            imageUrl = uploadedUrl;
        }

        const data = { ...formData, imageUrl };

        if (editing) {
            const response = await adminApi.updateDestination(editing, data);
            if (response.success) {
                resetForm();
                fetchDestinations();
            } else {
                alert(response.error || 'Update failed');
            }
        } else {
            const response = await adminApi.createDestination(data);
            if (response.success) {
                resetForm();
                fetchDestinations();
            } else {
                alert(response.error || 'Creation failed');
            }
        }
    };

    const startEdit = (dest: Destination) => {
        setFormData({
            name: dest.name,
            description: dest.description || '',
            imageUrl: dest.imageUrl || ''
        });
        setEditing(dest.id);
        setShowAdd(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete?')) return;
        const response = await adminApi.deleteDestination(id);
        if (response.success) {
            fetchDestinations();
        } else {
            alert(response.error || 'Failed');
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
                <h1 className="text-3xl font-bold text-white">Destinations</h1>
                <button
                    onClick={() => { if (showAdd) resetForm(); else setShowAdd(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                    {showAdd ? <X size={18} /> : <Plus size={18} />}
                    {showAdd ? 'Cancel' : 'Add'}
                </button>
            </div>

            {showAdd && (
                <GlassCard>
                    <h2 className="text-lg font-bold text-white mb-4">{editing ? 'Edit' : 'New'} Destination</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-white/60 block mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-white/60 block mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary h-24 resize-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-white/60 block mb-1">Image</label>
                                <div className="relative border-2 border-dashed border-white/10 rounded-xl p-4 h-40 flex flex-col items-center justify-center hover:border-primary/50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Upload size={24} className="text-white/40 mb-2" />
                                    <span className="text-sm text-white/40">{file ? file.name : 'Upload'}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full py-3 bg-primary rounded-xl font-bold text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : (editing ? 'Update' : 'Create')}
                        </button>
                    </form>
                </GlassCard>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {destinations.map((dest) => (
                    <GlassCard key={dest.id} className="p-0 overflow-hidden">
                        <div className="relative h-36">
                            {dest.imageUrl ? (
                                <img src={dest.imageUrl} alt={dest.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20">
                                    <ImageIcon size={32} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3">
                                <h3 className="font-bold text-white">{dest.name}</h3>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button
                                    onClick={() => startEdit(dest)}
                                    className="p-1.5 bg-black/50 rounded-lg text-white hover:bg-primary transition-colors"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(dest.id)}
                                    className="p-1.5 bg-black/50 rounded-lg text-white hover:bg-red-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="p-3">
                            <p className="text-white/40 text-sm line-clamp-2">
                                {dest.description || 'No description'}
                            </p>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
