import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, ArrowLeft, Calendar, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Editor } from '@tinymce/tinymce-react';

export default function KnowledgeSection() {
    const { isAdmin } = useAuth();
    const [view, setView] = useState('list'); // list, detail, edit
    const [posts, setPosts] = useState([]);
    const [currentPost, setCurrentPost] = useState(null);
    const [loading, setLoading] = useState(true);

    // Editor State
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");

    // TinyMCE Ref
    const editorRef = useRef(null);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('category', 'knowledge')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreate = () => {
        setEditingId(null);
        setEditTitle("");
        setEditContent("");
        setView('edit');
    };

    const handleEdit = (post, e) => {
        e.stopPropagation();
        setEditingId(post.id);
        setEditTitle(post.title || "");
        setEditContent(post.content || "");
        setView('edit');
    };

    const handleDelete = async (postId, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            const { error } = await supabase.from('posts').delete().eq('id', postId);
            if (error) throw error;
            setPosts(prev => prev.filter(p => p.id !== postId));
            if (currentPost?.id === postId) {
                setCurrentPost(null);
                setView('list');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post');
        }
    };

    const handleSave = async () => {
        if (!editTitle.trim()) {
            alert("Title is required");
            return;
        }

        // Get content from editor
        const content = editorRef.current ? editorRef.current.getContent() : editContent;

        const postData = {
            title: editTitle,
            content: content,
            category: 'knowledge',
            thumbnail_url: null
        };

        try {
            if (editingId) {
                // Update
                const { error } = await supabase
                    .from('posts')
                    .update(postData)
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('posts')
                    .insert([{
                        ...postData,
                        author_id: (await supabase.auth.getUser()).data.user.id
                    }]);
                if (error) throw error;
            }
            await fetchPosts();
            setView('list');
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post');
        }
    };

    // TinyMCE Image Upload Handler
    const handleImageUpload = (blobInfo, progress) => new Promise((resolve, reject) => {
        const file = blobInfo.blob();
        const fileExt = file.name ? file.name.split('.').pop() : 'png';
        const fileName = `knowledge-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        supabase.storage
            .from('images')
            .upload(filePath, file)
            .then(({ data, error }) => {
                if (error) {
                    reject('Upload failed: ' + error.message);
                    return;
                }
                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(filePath);

                resolve(publicUrl);
            })
            .catch(err => reject('Upload failed: ' + err.message));
    });

    if (view === 'edit') {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Title"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full text-2xl font-bold border-b border-gray-300 focus:border-seonbi-darkblue outline-none py-2"
                    />
                </div>

                <div className="mb-12 h-[500px]">
                    <Editor
                        onInit={(evt, editor) => editorRef.current = editor}
                        apiKey="dnpwr96bjgsa5euhv4fga95apdhju6xdtzhmopsgee926th1"
                        // Note: TinyMCE warns if no API key is provided, but works for development locally often or shows a banner.
                        // Ideally, we'd use an ENV var, but for now we won't block.
                        initialValue={editContent}
                        init={{
                            height: 500,
                            menubar: true,
                            plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                            ],
                            toolbar: 'undo redo | blocks | ' +
                                'bold italic forecolor | alignleft aligncenter ' +
                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                'removeformat | image media table | help',
                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                            images_upload_handler: handleImageUpload,
                            entity_encoding: 'raw'
                        }}
                    />
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4">
                    <button onClick={() => setView('list')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-seonbi-darkblue text-white rounded hover:bg-blue-700">Publish</button>
                </div>
            </div>
        );
    }

    if (view === 'detail' && currentPost) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 min-h-[500px]">
                <button onClick={() => setView('list')} className="flex items-center gap-1 text-gray-500 hover:text-seonbi-darkblue mb-6">
                    <ArrowLeft size={18} /> Back to List
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentPost.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 pb-4 border-b border-gray-100">
                    <Calendar size={14} />
                    {new Date(currentPost.created_at).toLocaleDateString()}

                    {isAdmin && (
                        <div className="ml-auto flex gap-2">
                            <button onClick={(e) => handleEdit(currentPost, e)} className="text-blue-600 hover:underline">Edit</button>
                            <button onClick={(e) => handleDelete(currentPost.id, e)} className="text-red-500 hover:underline">Delete</button>
                        </div>
                    )}
                </div>

                <div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: currentPost.content }} />
            </div>
        );
    }

    // List View
    return (
        <div className="py-4 space-y-4">
            {isAdmin && (
                <div className="flex justify-end">
                    <button onClick={handleCreate} className="flex items-center gap-2 bg-seonbi-darkgreen text-white px-4 py-2 rounded shadow hover:bg-green-700 transition">
                        <Plus size={18} /> Write Post
                    </button>
                </div>
            )}

            <div className="space-y-0 divide-y divide-gray-100 border border-gray-100 rounded-lg bg-white shadow-sm">
                {posts.length === 0 && !loading && (
                    <div className="p-8 text-center text-gray-500">No posts yet.</div>
                )}

                {posts.map(post => (
                    <div
                        key={post.id}
                        onClick={() => { setCurrentPost(post); setView('detail'); }}
                        className="p-6 hover:bg-gray-50 cursor-pointer transition-colors flex gap-6 group relative"
                    >
                        {isAdmin && (
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={(e) => handleEdit(post, e)}
                                    className="bg-white p-2 rounded-full text-gray-600 hover:text-blue-600 shadow border border-gray-100"
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => handleDelete(post.id, e)}
                                    className="bg-white p-2 rounded-full text-gray-600 hover:text-red-500 shadow border border-gray-100"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}

                        {post.thumbnail_url && (
                            <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="flex-grow">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-seonbi-darkblue">{post.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">
                                {(post.content || '').replace(/<[^>]+>/g, '')}
                            </p>
                            <div className="mt-2 text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
