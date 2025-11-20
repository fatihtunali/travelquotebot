'use client';

import DestinationCard from './DestinationCard';

const destinations = [
    {
        title: 'Turkey',
        slug: 'turkey',
        description: 'From the fairy chimneys of Cappadocia to the turquoise waters of the Aegean. Experience a blend of history and natural beauty.',
        image: 'https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?q=80&w=800&auto=format&fit=crop',
        toursCount: 142
    },
    {
        title: 'Greece',
        slug: 'greece',
        description: 'Iconic whitewashed islands, ancient ruins, and Mediterranean cuisine. The perfect destination for island hopping.',
        image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop',
        toursCount: 98
    },
    {
        title: 'Egypt',
        slug: 'egypt',
        description: 'Walk in the footsteps of pharaohs. Visit the Great Pyramids, cruise the Nile, and explore vibrant bazaars.',
        image: 'https://images.unsplash.com/photo-1539650116455-8efdb4f85bb8?q=80&w=800&auto=format&fit=crop',
        toursCount: 75
    }
];

export default function DestinationsGrid() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {destinations.map((destination, index) => (
                        <DestinationCard
                            key={destination.slug}
                            index={index}
                            {...destination}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
