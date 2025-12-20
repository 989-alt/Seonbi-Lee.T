import { useState, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';

export default function AdminPage() {
    const { user, loading } = useAuth();
    const editorRef = useRef(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); // Initial content
    const [category, setCategory] = useState('activity'); // activity or knowledge
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If loading, show nothing or spinner. 
    // If not loading and no user or not admin, redirect.
    if (!loading) {
        if (!user || user.email !== 'sunhak98@naver.com') {
            return <Navigate to="/" replace />;
        }
    }

    const handleImageUpload = (blobInfo, progress) => new Promise((resolve, reject) => {
        const file = blobInfo.blob();
        const fileExt = file.name ? file.name.split('.').pop() : 'png';
        const fileName = `admin-${Date.now()}.${fileExt}`;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const editorContent = editorRef.current ? editorRef.current.getContent() : content;

            const { error } = await supabase
                .from('posts')
                .insert([
                    {
                        title,
                        content: editorContent,
                        category,
                        author_id: user.id
                    }
                ]);

            if (error) throw error;

            alert('Post created successfully!');
            setTitle('');
            setContent('');
            if (editorRef.current) {
                editorRef.current.setContent('');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Create New Post</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                            <option value="activity">Developer Activity</option>
                            <option value="knowledge">Knowledge Share</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <div className="h-96 mb-12">
                            <Editor
                                onInit={(evt, editor) => editorRef.current = editor}
                                apiKey="no-api-key"
                                initialValue={content}
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
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-seonbi-darkblue text-white py-3 rounded-lg hover:bg-blue-800 transition font-bold"
                    >
                        {isSubmitting ? 'Publishing...' : 'Publish Post'}
                    </button>
                </form>
            </div>
        </div>
    );
}
