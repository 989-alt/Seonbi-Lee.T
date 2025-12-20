import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import MaterialCard from './MaterialCard';
import MaterialUploadModal from './MaterialUploadModal';
import { useAuth } from '../../context/AuthContext';
import { Plus, ArrowUpDown } from 'lucide-react';

export default function MaterialGrid() {
    const { isAdmin } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('latest'); // latest, popular
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('posts')
                .select('*')
                .neq('category', 'knowledge'); // Exclude knowledge posts (blog)

            if (sortBy === 'popular') {
                query = query.order('likes', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query;

            if (error) throw error;
            setMaterials(data || []);
        } catch (err) {
            console.error('Error fetching materials:', err);
            setError('Failed to load materials.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, [sortBy]); // Refetch when sort changes

    const handleDelete = (id) => {
        setMaterials(prev => prev.filter(m => m.id !== id));
    };

    return (
        <div className="py-8">
            {/* Header / Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center shadow-sm">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-gray-700 font-medium px-2 py-1 cursor-pointer"
                        >
                            <option value="latest">최신순</option>
                            <option value="popular">인기순</option>
                        </select>
                        <ArrowUpDown size={14} className="text-gray-400 mr-2" />
                    </div>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-2 bg-seonbi-darkblue text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-800 transition font-bold"
                    >
                        <Plus size={18} />
                        자료 등록
                    </button>
                )}
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-20">Loading materials...</div>
            ) : error ? (
                <div className="text-center py-20 text-red-500">{error}</div>
            ) : materials.length === 0 ? (
                <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-lg font-medium">등록된 자료가 없습니다.</p>
                    {isAdmin && <p className="text-sm mt-1">자료 등록 버튼을 눌러 첫 자료를 공유해보세요!</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {materials.map(post => (
                        <MaterialCard
                            key={post.id}
                            post={post}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <MaterialUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={fetchMaterials} // Reload list after upload
            />
        </div>
    );
}
