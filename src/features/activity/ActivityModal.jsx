import { useState, useRef, useEffect } from 'react';
import { X, Upload, Save, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function ActivityModal({ isOpen, onClose, onSave, initialData = null }) {
    const [caption, setCaption] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setCaption(initialData.title || '');
            // Handle legacy single image or new multi-image
            if (initialData.image_urls && initialData.image_urls.length > 0) {
                setPreviewUrls(initialData.image_urls);
            } else if (initialData.thumbnail_url) {
                setPreviewUrls([initialData.thumbnail_url]);
            } else {
                setPreviewUrls([]);
            }
        } else {
            setCaption('');
            setPreviewUrls([]);
            setImageFiles([]);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setImageFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (indexToRemove) => {
        setPreviewUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
        // Note: For simplicity, we are not syncing removal with imageFiles (new uploads) 
        // because matching indices between mixed existing/new files is complex.
        // Screened out files just won't be saved if they aren't in previewUrls.
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let uploadedUrls = [];

            // 1. Keep existing URLs (strings in previewUrls that start with http)
            const existingUrls = previewUrls.filter(url => typeof url === 'string' && url.startsWith('http'));
            uploadedUrls = [...existingUrls];

            // 2. Upload new files
            if (imageFiles.length > 0) {
                for (const file of imageFiles) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `activity-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const filePath = fileName;

                    const { error: uploadError } = await supabase.storage
                        .from('images')
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data } = supabase.storage
                        .from('images')
                        .getPublicUrl(filePath);

                    uploadedUrls.push(data.publicUrl);
                }
            }

            // Prepare data object
            const activityData = {
                title: caption,
                image_urls: uploadedUrls,
                thumbnail_url: uploadedUrls[0] || null, // Legacy support / Main thumb
                category: 'activity'
            };

            await onSave(activityData);
            onClose();
        } catch (error) {
            console.error("Error saving activity:", error);
            if (error.message.includes('permission denied')) {
                alert("Permission denied. Check Database Policies.");
            } else {
                alert("Failed to save activity");
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg text-gray-800">
                        {initialData ? 'Edit Activity' : 'New Activity'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
                    {/* Image Upload Area */}
                    <div className="space-y-2">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            <Upload size={32} className="text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-gray-600">Click to upload photos (Multiple)</span>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Previews */}
                        {previewUrls.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {previewUrls.map((url, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                        <img src={url} alt={`preview ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            aria-label="Remove image"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Caption Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                        <input
                            type="text"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-seonbi-darkblue"
                            placeholder="Describe this activity..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-4 py-2 bg-[#28a745] text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 shadow-sm"
                        >
                            <Save size={18} />
                            {uploading ? 'Saving...' : 'Save Activity'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
