import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <main className="flex-grow pt-16">
                {children}
            </main>
            <Footer />
        </div>
    );
}
