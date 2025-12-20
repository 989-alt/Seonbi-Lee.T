import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="text-seonbi-darkblue">선비이선생</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <button
                                onClick={logout}
                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <LogOut size={16} />
                                Admin Logout
                            </button>
                        ) : (
                            <Link to="/admin/login" className="text-gray-300 hover:text-gray-500 transition-colors">
                                <Lock size={16} />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
