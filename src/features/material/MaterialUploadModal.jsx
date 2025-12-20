import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['업무 경감', '학습 편의', '학급 경영', '기타'];

export default function MaterialUploadModal({ isOpen, onClose, onSuccess }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [linkUrl, setLinkUrl] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let thumbnailUrl = null;

            // 1. Upload Thumbnail (if selected)
            if (thumbnailFile) {
                const fileExt = thumbnailFile.name.split('.').pop();
                const fileName = `thumbnail-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('images') // Using 'images' bucket as 'thumbnails' might not exist
                    .upload(filePath, thumbnailFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(filePath);

                thumbnailUrl = publicUrl;
            }

            // 2. Insert Post
            const { error } = await supabase
                .from('posts')
                .insert([
                    {
                        title,
                        category,
                        link_url: linkUrl,
                        likes: 0,
                        author_id: user?.id,
                        thumbnail_url: thumbnailUrl
                    }
                ]);

            if (error) throw error;

            alert('Material shared successfully!');
            setTitle('');
            setLinkUrl('');
            setCategory(CATEGORIES[0]);
            setThumbnailFile(null);
            if (onSuccess) onSuccess();
            onClose();

        } catch (error) {
            console.error('Error uploading material:', error);
            alert('Failed to upload material: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-800">자료 공유하기</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-seonbi-blue focus:border-transparent outline-none"
                            placeholder="예: 생기부 생성기"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">링크 주소 (URL)</label>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-seonbi-blue focus:border-transparent outline-none"
                            placeholder="https://example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">썸네일 이미지 (선택)</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition"
                        >
                            {thumbnailFile ? (
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-seonbi-darkblue">{thumbnailFile.name}</p>
                                    <p className="text-xs text-gray-400">Click to change</p>
                                </div>
                            ) : (
                                <>
                                    <ImageIcon size={24} className="mb-2" />
                                    <span className="text-sm">클릭하여 이미지 업로드</span>
                                </>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => setThumbnailFile(e.target.files[0])}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-seonbi-darkblue text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? '업로드 중...' : (
                                <>
                                    <Upload size={18} />
                                    공유하기
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
