import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import AboutHero from '@/components/about/AboutHero';
import CompanyInfo from '@/components/about/CompanyInfo';

export const metadata = {
    title: 'About Us - Travel Quote Bot',
    description: 'Learn more about Travel Quote Bot and our mission to revolutionize the travel industry.',
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <AboutHero />
            <CompanyInfo />
            <Footer />
        </main>
    );
}
