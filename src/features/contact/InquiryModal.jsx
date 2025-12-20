import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function InquiryModal({ isOpen, onClose }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('inquiries')
                .insert([{ email, message }]);

            if (error) throw error;

            alert("문의가 접수되었습니다. 감사합니다.");
            setEmail('');
            setMessage('');
            onClose();
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            alert("상담 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                >
                    <X size={24} />
                </button>

                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">문의하기</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        이선학 선생님에게 궁금한 점이나 제안할 내용을 남겨주세요.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                이메일 (선택)
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-seonbi-darkblue outline-none"
                                placeholder="답변 받을 이메일 주소"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                문의 내용 <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 resize-none focus:ring-2 focus:ring-seonbi-darkblue outline-none"
                                placeholder="내용을 입력해주세요."
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-seonbi-darkblue text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Send size={18} />
                            {isSubmitting ? '전송 중...' : '보내기'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
