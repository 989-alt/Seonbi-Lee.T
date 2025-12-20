import { useVisitorStats } from '../../hooks/useVisitorStats';

export default function VisitorStats() {
    const { stats, loading } = useVisitorStats();

    if (loading) return <div className="text-xs text-gray-400">Loading stats...</div>;

    return (
        <div className="bg-white/50 p-4 rounded-lg shadow-sm border border-gray-100 max-w-sm">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Visitor Statistics</h3>
            <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                    <div className="text-lg font-bold text-gray-700">{stats.today}</div>
                    <div className="text-[10px] text-gray-400">Today</div>
                </div>
                <div>
                    <div className="text-lg font-bold text-gray-700">{stats.total}</div>
                    <div className="text-[10px] text-gray-400">Total</div>
                </div>
            </div>
        </div>
    );
}
