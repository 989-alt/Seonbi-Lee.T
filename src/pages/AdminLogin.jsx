import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await login(email, password);
            if (error) throw error;
            navigate('/');
        } catch (err) {
            console.error(err);
            if (err.message.includes("Invalid login credentials")) {
                setError("이메일 또는 비밀번호를 확인해주세요.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Seonbi Portfolio 로그인</h2>
                    <p className="text-sm text-gray-500">포트폴리오 관리를 위해 로그인하세요.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                            placeholder="user@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full border-gray-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>

                    <div className="text-center mt-4 text-xs text-gray-400">
                        * 관리자 전용 (회원가입 불가)
                    </div>
                </form>
            </div>
        </div>
    );
}
