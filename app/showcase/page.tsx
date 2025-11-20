import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import VideoSection from '@/components/showcase/VideoSection';
import StatsSection from '@/components/showcase/StatsSection';

export const metadata = {
    title: 'Showcase - Travel Quote Bot',
    description: 'See how Travel Quote Bot works and the impact it has on travel agencies.',
};

export default function ShowcasePage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-20">
                <VideoSection />
                <StatsSection />
            </div>
            <Footer />
        </main>
    );
}
