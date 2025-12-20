import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useVisitorStats() {
    const [stats, setStats] = useState({ today: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAndIncrementStats = async () => {
            try {
                // 1. Increment Logic (RPC)
                const visited = sessionStorage.getItem('visited');

                if (!visited) {
                    const { error } = await supabase.rpc('track_visit');
                    if (!error) {
                        sessionStorage.setItem('visited', 'true');
                    } else {
                        console.error('Error tracking visit:', error);
                    }
                }

                // 2. Fetching Logic (Read Stats)
                const { data, error: fetchError } = await supabase
                    .from('visitor_stats')
                    .select('count, date');

                if (fetchError) throw fetchError;

                // Calculate frontend side
                const total = data?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0;

                // Get today's count (handle timezone by relying on ISO date string from DB or frontend)
                // Assuming 'date' in DB is stored as YYYY-MM-DD
                const todayStr = new Date().toISOString().split('T')[0];
                const today = data?.find(item => item.date === todayStr)?.count || 0;

                setStats({ today, total });

            } catch (err) {
                console.error('Error updating visitor stats:', err);
            } finally {
                setLoading(false);
            }
        };

        checkAndIncrementStats();
    }, []);

    return { stats, loading };
}
