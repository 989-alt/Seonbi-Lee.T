import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useVisitorStats() {
    const [stats, setStats] = useState({ daily: 0, weekly: 0, monthly: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAndIncrementStats = async () => {
            try {
                // 1. Get accurate KST Date objects
                const now = new Date();
                const kstOffset = 9 * 60 * 60 * 1000;
                const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
                const kstDate = new Date(utc + kstOffset);

                const todayStr = kstDate.toISOString().split('T')[0];

                // Calculate Monday of current week (KST)
                const day = kstDate.getDay(); // 0 (Sun) - 6 (Sat)
                const diff = kstDate.getDate() - day + (day === 0 ? -6 : 1);
                const mondayDate = new Date(kstDate);
                mondayDate.setDate(diff);
                const mondayStr = mondayDate.toISOString().split('T')[0];

                // Calculate 1st of Month (KST)
                const monthStr = `${kstDate.getFullYear()}-${String(kstDate.getMonth() + 1).padStart(2, '0')}-01`;

                // 2. Fetch current stats
                const { data: currentStats, error } = await supabase
                    .from('visitor_stats')
                    .select('*');

                if (error) throw error;

                const statsMap = currentStats?.reduce((acc, curr) => ({ ...acc, [curr.type]: curr }), {}) || {};

                // 3. Determine New Counts
                let newDaily = 0;
                let newWeekly = 0;
                let newMonthly = 0;
                const updates = [];

                // --- Daily ---
                const dailyStat = statsMap['daily'];
                if (dailyStat && dailyStat.last_reset_date === todayStr) {
                    newDaily = (dailyStat.count || 0) + 1;
                } else {
                    newDaily = 1; // Reset or Init
                }
                updates.push({ type: 'daily', count: newDaily, last_reset_date: todayStr });

                // --- Weekly ---
                const weeklyStat = statsMap['weekly'];
                if (weeklyStat && weeklyStat.last_reset_date === mondayStr) {
                    newWeekly = (weeklyStat.count || 0) + 1;
                } else {
                    newWeekly = 1; // Reset or Init
                }
                // Self-Healing: Weekly cannot be less than Daily (if in same week scope)
                // Assuming resets work correctly, this edge case handles "Daily > Weekly" anomalies
                if (newWeekly < newDaily) newWeekly = newDaily;
                updates.push({ type: 'weekly', count: newWeekly, last_reset_date: mondayStr });

                // --- Monthly ---
                const monthlyStat = statsMap['monthly'];
                if (monthlyStat && monthlyStat.last_reset_date === monthStr) {
                    newMonthly = (monthlyStat.count || 0) + 1;
                } else {
                    newMonthly = 1;
                }
                // Self-Healing: Monthly cannot be less than Weekly
                if (newMonthly < newWeekly) newMonthly = newWeekly;
                updates.push({ type: 'monthly', count: newMonthly, last_reset_date: monthStr });

                // 4. Update DB
                for (const update of updates) {
                    await supabase
                        .from('visitor_stats')
                        .upsert(update, { onConflict: 'type' });
                }

                // 5. Update State
                setStats({ daily: newDaily, weekly: newWeekly, monthly: newMonthly });

            } catch (err) {
                console.error('Error updating visitor stats:', err);
            } finally {
                setLoading(false);
            }
        };

        checkAndIncrementStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { stats, loading };
}
