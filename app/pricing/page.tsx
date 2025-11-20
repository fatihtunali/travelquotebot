import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import PricingTables from '@/components/pricing/PricingTables';
import FAQ from '@/components/pricing/FAQ';

export const metadata = {
    title: 'Pricing - Travel Quote Bot',
    description: 'Simple, transparent pricing for travel agencies of all sizes.',
};

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-20">
                <PricingTables />
                <FAQ />
            </div>
            <Footer />
        </main>
    );
}
