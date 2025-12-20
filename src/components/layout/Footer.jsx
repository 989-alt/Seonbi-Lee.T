import VisitorStats from '../../features/analytics/VisitorStats';

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 mt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h4 className="font-bold text-gray-900">Seonbi Teacher Portfolio</h4>
                        <p className="text-sm text-gray-500 mt-2">© 2024 All rights reserved.</p>
                        <p className="text-sm text-gray-500">Contact: sunhak98@naver.com</p>
                    </div>

                    <div className="w-full md:w-auto">
                        <VisitorStats />
                    </div>
                </div>
            </div>
        </footer>
    );
}
