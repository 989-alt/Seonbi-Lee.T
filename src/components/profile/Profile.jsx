import { Mail, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InquiryModal from '../../features/contact/InquiryModal';
import profileImage from '../../assets/profile.jpeg';

const careers = [
    "상상그리다필름 콘텐츠팀",
    "몽당분필 10기",
    "경기 교사 크리에이터 2기",
    "2024 교실혁명 선도교사",
    "2025 AIEDAP 마스터 교원",
    "ATC 파이썬 주니어스쿨/헬로메이플 강사 및 연구회원"
];

export default function Profile() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [isContactOpen, setIsContactOpen] = useState(false);

    return (
        <section className="bg-gradient-to-b from-seonbi-blue to-white py-16 px-4">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
                {/* Profile Image & Bio */}
                <div className="flex-1 text-center md:text-left space-y-6">
                    <div className="relative inline-block">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto md:mx-0 bg-gray-200">
                            {/* Placeholder */}
                            <img src={profileImage} alt="Seonbi Teacher" className="w-full h-full object-cover" />
                        </div>
                        <button
                            onClick={() => setIsContactOpen(true)}
                            className="absolute bottom-0 right-0 md:-right-4 bg-blue-800 text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform duration-300 z-10 ring-4 ring-white"
                            title="문의하기"
                        >
                            <MessageCircle size={20} />
                        </button>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">선비이선생 <span className="text-lg font-normal text-gray-600">(이선학)</span></h1>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            AI를 활용해 수업과 학급 운영에 도움이 되는 여러 프로그램들을 만드는 교사 이선학입니다.<br />
                            콘텐츠 제안은 언제나 환영, 피드백은 최대한 빠르게 반영하겠습니다.
                        </p>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500">
                                <Mail size={16} />
                                <span>sunhak98@naver.com</span>
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={() => navigate('/admin/inquiries')}
                                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline font-medium text-left"
                                >
                                    문의함 확인 (Check Inquiries)
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Career Section */}
                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Career History</h3>
                    <ul className="space-y-3">
                        {careers.map((career, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                                <div className="w-2 h-2 mt-1.5 rounded-full bg-seonbi-darkgreen flex-shrink-0" />
                                {career}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <InquiryModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
        </section>
    );
}
