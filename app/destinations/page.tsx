import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import DestinationsGrid from '@/components/destinations/DestinationsGrid';

export const metadata = {
    title: 'Destinations - Travel Quote Bot',
    description: 'Explore our supported destinations including Turkey, Greece, Egypt, and more.',
};

export default function DestinationsPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Simple Hero for Destinations */}
            <div className="bg-blue-900 text-white pt-32 pb-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-6">Explore Destinations</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Curated databases of hotels, tours, and transfers for the world's most popular destinations.
                    </p>
                </div>
            </div>

            <DestinationsGrid />
            <Footer />
        </main>
    );
}
