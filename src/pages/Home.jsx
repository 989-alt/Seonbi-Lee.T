import { useState } from 'react';
import Profile from '../components/profile/Profile';
import MaterialGrid from '../features/material/MaterialGrid';
import ActivityFeed from '../features/activity/ActivityFeed';
import KnowledgeSection from '../features/knowledge/KnowledgeSection';
import { LayoutGrid, Image, BookOpen } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const TABS = [
    { id: 'material', label: '자료 공유', icon: LayoutGrid, sub: 'Material Share' },
    { id: 'activity', label: '개발자 활동', icon: Image, sub: 'Developer Activity' },
    { id: 'knowledge', label: '지식 공유', icon: BookOpen, sub: 'Knowledge Share' },
];

export default function Home() {
    const [activeTab, setActiveTab] = useState('material');

    return (
        <div className="min-h-screen bg-gray-50">
            <Profile />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 flex overflow-x-auto">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-lg transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-seonbi-blue text-seonbi-darkblue font-bold shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <tab.icon size={20} />
                            <div className="text-left">
                                <div className="text-sm">{tab.label}</div>
                                <div className="text-[10px] opacity-70 font-normal uppercase">{tab.sub}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-8 min-h-[500px]">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'material' && <MaterialGrid />}
                        {activeTab === 'activity' && <ActivityFeed />}
                        {activeTab === 'knowledge' && <KnowledgeSection />}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
