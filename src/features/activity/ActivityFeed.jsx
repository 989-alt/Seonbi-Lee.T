import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, X, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import ActivityModal from './ActivityModal';

export default function ActivityFeed() {
    const { isAdmin } = useAuth();
    const [activities, setActivities] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [imageIndices, setImageIndices] = useState({});

    const nextImage = (e, itemId, count) => {
        e.stopPropagation();
        setImageIndices(prev => ({
            ...prev,
            [itemId]: ((prev[itemId] || 0) + 1) % count
        }));
    };

    const prevImage = (e, itemId, count) => {
        e.stopPropagation();
        setImageIndices(prev => ({
            ...prev,
            [itemId]: ((prev[itemId] || 0) - 1 + count) % count
        }));
    };

    // Fetch activities
    const fetchActivities = async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('category', 'activity')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching activities:', error);
        else setActivities(data || []);
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const handleSave = async (activityData) => {
        try {
            if (editingActivity) {
                // Update
                const { error } = await supabase
                    .from('posts')
                    .update(activityData)
                    .eq('id', editingActivity.id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('posts')
                    .insert([{
                        ...activityData,
                        author_id: (await supabase.auth.getUser()).data.user.id
                    }]);
                if (error) throw error;
            }
            fetchActivities();
        } catch (error) {
            console.error('Error saving activity:', error);
            if (error.message.includes('permission denied')) {
                alert("Permission denied. Ensure you have run the updated SQL script.");
            } else {
                alert('Failed to save activity');
            }
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this activity?")) return;

        try {
            const { error } = await supabase.from('posts').delete().eq('id', id);
            if (error) throw error;
            setActivities(prev => prev.filter(item => item.id !== id));
            if (selectedId === id) setSelectedId(null);
        } catch (error) {
            console.error('Error deleting activity:', error);
            alert('Failed to delete activity');
        }
    };

    const handleEdit = (item, e) => {
        e.stopPropagation();
        setEditingActivity(item);
        setIsModalOpen(true);
    };

    const openNewModal = () => {
        setEditingActivity(null);
        setIsModalOpen(true);
    };

    return (
        <div className="py-8">
            {isAdmin && (
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={openNewModal}
                        className="flex items-center gap-2 bg-[#007bff] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition shadow-sm font-medium"
                    >
                        <Plus size={20} />
                        Add Activity
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {activities.map(item => {
                    const images = item.image_urls && item.image_urls.length > 0 ? item.image_urls : (item.thumbnail_url ? [item.thumbnail_url] : []);
                    const currentIndex = imageIndices[item.id] || 0;

                    return (
                        <motion.div
                            layoutId={`card-${item.id}`}
                            key={item.id}
                            onClick={() => setSelectedId(item.id)}
                            className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer relative group shadow-sm hover:shadow-md transition-shadow"
                        >
                            {images.length > 0 ? (
                                <>
                                    <img
                                        src={images[currentIndex]}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />

                                    {/* Carousel Controls */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => prevImage(e, item.id, images.length)}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <button
                                                onClick={(e) => nextImage(e, item.id, images.length)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                                {images.map((_, idx) => (
                                                    <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`} />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">No Image</div>
                            )}

                            {/* ... rest of overlays ... */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />

                            {isAdmin && (
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <button
                                        onClick={(e) => handleEdit(item, e)}
                                        className="bg-white p-1.5 rounded-full text-gray-700 hover:text-blue-600 shadow"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(item.id, e)}
                                        className="bg-white p-1.5 rounded-full text-gray-700 hover:text-red-500 shadow"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <p className="text-sm font-medium truncate">{item.title}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {selectedId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedId(null)}>
                        {activities.filter(a => a.id === selectedId).map(item => (
                            <motion.div
                                layoutId={`card-${item.id}`}
                                key={item.id}
                                className="bg-white rounded-lg overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="relative bg-gray-100 flex-shrink-0 overflow-y-auto max-h-[60vh]">
                                    {/* Display all images if multi */}
                                    {item.image_urls && item.image_urls.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-1">
                                            {item.image_urls.map((url, i) => (
                                                <img key={i} src={url} alt={`${item.title} ${i}`} className="w-full object-contain" />
                                            ))}
                                        </div>
                                    ) : item.thumbnail_url ? (
                                        <img src={item.thumbnail_url} alt={item.title} className="w-full object-contain" />
                                    ) : (
                                        <div className="aspect-video flex items-center justify-center text-gray-400">No Image</div>
                                    )}

                                    <button
                                        onClick={() => setSelectedId(null)}
                                        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 sticky"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-6 overflow-y-auto">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Edit/Create Modal */}
            <ActivityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingActivity}
            />
        </div>
    );
}
