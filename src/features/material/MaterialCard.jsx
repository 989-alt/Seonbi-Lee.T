import { useState, useRef } from 'react';
import { Heart, MessageSquare, ExternalLink, MoreVertical, Upload, Trash2 } from 'lucide-react';
import CommentSection from '../../components/common/CommentSection';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

export default function MaterialCard({ post, onDelete }) {
    const { isAdmin } = useAuth();
    const [likes, setLikes] = useState(post.likes ?? 0);
    const [showComments, setShowComments] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Thumbnail Upload Refs
    const fileInputRef = useRef(null);
    const [thumbnail, setThumbnail] = useState(post.thumbnail_url);

    const handleLike = async (e) => {
        e.stopPropagation(); // Prevent card click
        // Optimistic Update
        const currentLikes = likes;
        const newLikes = currentLikes + 1;
        setLikes(newLikes);

        console.log("Updating likes for", post.id, "to", newLikes);

        try {
            const { error } = await supabase
                .from('posts')
                .update({ likes: newLikes })
                .eq('id', post.id);

            if (error) throw error;
        } catch (err) {
            console.error('Error updating likes:', err);
            // Revert on failure
            setLikes(currentLikes);
        }
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `material-${post.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get URL
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            // Update DB
            const { error: dbError } = await supabase
                .from('posts')
                .update({ thumbnail_url: publicUrl })
                .eq('id', post.id);

            if (dbError) throw dbError;

            setThumbnail(publicUrl);
            setIsMenuOpen(false);
            alert("Thumbnail updated!");

        } catch (err) {
            console.error("Error uploading thumbnail:", err);
            alert("Failed to upload thumbnail");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this material?")) return;

        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.id);

            if (error) throw error;

            if (onDelete) onDelete(post.id);
            else window.location.reload();

        } catch (error) {
            console.error('Error deleting material:', error);
            alert('Failed to delete material');
        }
    };

    const handleCardClick = () => {
        if (post.link_url) {
            window.open(post.link_url, '_blank');
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col relative cursor-pointer group"
        >
            {/* Admin Menu */}
            {isAdmin && (
                <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={(e) => { e.preventDefault(); setIsMenuOpen(!isMenuOpen); }}
                        className="bg-white/80 p-1 rounded-full shadow hover:bg-white"
                    >
                        <MoreVertical size={16} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 text-sm z-20">
                            <button
                                onClick={(e) => { e.preventDefault(); fileInputRef.current.click(); }}
                                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50 text-gray-700"
                            >
                                <Upload size={14} />
                                Change Thumbnail
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); handleDelete(); }}
                                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-red-600"
                            >
                                <Trash2 size={14} />
                                Delete Material
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleThumbnailUpload}
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="relative h-40 bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden flex items-center justify-center">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                            e.target.onerror = null;
                            setThumbnail(null); // Fallback if image fails
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 group-hover:text-seonbi-blue transition-colors duration-300">
                        <div className="bg-white p-3 rounded-full shadow-sm">
                            <ExternalLink size={24} className="text-gray-400 group-hover:text-seonbi-blue" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-2">
                    <span className="text-xs font-semibold text-seonbi-darkblue bg-blue-50 px-2 py-1 rounded-full">
                        {post.category || '기타'}
                    </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{post.title}</h3>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto" onClick={(e) => e.stopPropagation()}>
                    <button onClick={handleLike} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors">
                        <Heart size={18} className={likes > 0 ? "fill-red-500 text-red-500" : ""} />
                        <span className="like-count">
                            {likes !== undefined && likes !== null ? likes : 0}
                        </span>
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-seonbi-darkblue transition-colors">
                        <MessageSquare size={18} />
                    </button>
                </div>
            </div>

            {/* Comment Section (Collapsible) */}
            {showComments && (
                <div onClick={(e) => e.stopPropagation()}>
                    <CommentSection entityType="post" entityId={post.id} />
                </div>
            )}
        </div>
    );
}
