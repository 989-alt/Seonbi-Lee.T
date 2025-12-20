import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Clock, ArrowLeft } from 'lucide-react';

export default function AdminInquiriesPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/');
            return;
        }

        if (isAdmin) {
            fetchInquiries();
        }
    }, [isAdmin, authLoading, navigate]);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('inquiries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInquiries(data || []);
        } catch (error) {
            console.error('Error fetching inquiries:', error);
            alert('Failed to load inquiries.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Inquiry Messages</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {inquiries.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No inquiries received yet.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {inquiries.map((inq) => (
                            <div key={inq.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2 font-medium text-gray-800">
                                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                            <Mail size={16} />
                                        </div>
                                        {inq.email || "Anonymous"}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <Clock size={12} />
                                        {new Date(inq.created_at).toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap border border-gray-100 text-sm leading-relaxed">
                                    {inq.message}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
