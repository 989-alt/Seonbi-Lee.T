import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { CornerDownLeft, Trash2 } from 'lucide-react';

export default function CommentSection({ entityType, entityId }) { // entityType: 'material', 'post'
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    const checkIsAdmin = (u) => u?.email === 'sunhak98@naver.com';

    useEffect(() => {
        fetchComments();
    }, [entityId, entityType]);

    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setComments(data || []);
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!user) {
            alert("Please login to comment");
            return;
        }

        try {
            const { error } = await supabase
                .from('comments')
                .insert([
                    {
                        entity_type: entityType,
                        entity_id: entityId,
                        content: newComment,
                        author_id: user.id,
                        author_email: user.email // Optional, good for display
                    }
                ]);

            if (error) throw error;

            setNewComment("");
            fetchComments();
        } catch (err) {
            console.error('Error adding comment:', err);
            alert("Failed to add comment");
        }
    };

    const handleDelete = async (commentId, authorId) => {
        if (!user) return;

        // Permission Check: Admin OR Author
        if (!checkIsAdmin(user) && user.id !== authorId) {
            alert("You are not authorized to delete this comment.");
            return;
        }

        if (!confirm("Are you sure you want to delete this comment?")) return;

        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;
            fetchComments();
        } catch (err) {
            console.error('Error deleting comment:', err);
            alert("Failed to delete comment");
        }
    };

    return (
        <div className="bg-gray-50 p-4 border-t border-gray-100 text-sm">
            <div className="space-y-3 mb-3 max-h-40 overflow-y-auto">
                {loading ? <p className="text-gray-400">Loading comments...</p> :
                    comments.length === 0 ? <p className="text-gray-400 text-xs italic">No comments yet.</p> :
                        comments.map(c => (
                            <div key={c.id} className="bg-white p-2 rounded border border-gray-200 flex justify-between group">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 block mb-1">
                                        {c.author_email ? c.author_email.split('@')[0] : 'Anonymous'}
                                    </span>
                                    <p className="text-gray-800">{c.content}</p>
                                </div>
                                {(user && (checkIsAdmin(user) || user.id === c.author_id)) && (
                                    <button
                                        onClick={() => handleDelete(c.id, c.author_id)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))
                }
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2 relative">
                <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    className="flex-grow text-xs border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:border-seonbi-darkblue"
                    placeholder={user ? "Leave a comment..." : "Login to comment"}
                    disabled={!user}
                />
                <button
                    type="submit"
                    className={`absolute right-1 top-1 p-1 rounded transition-colors ${!newComment.trim() ? 'text-gray-300' : 'text-seonbi-darkblue hover:bg-blue-50'}`}
                    disabled={!user || !newComment.trim()}
                >
                    <CornerDownLeft size={16} />
                </button>
            </form>
        </div>
    );
}
