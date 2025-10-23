'use client';

interface Tour {
  id: number;
  tour_name: string;
  city: string;
  photo_url_1?: string;
  photo_url_2?: string;
  photo_url_3?: string;
}

interface SightseeingBannerProps {
  tours: Tour[];
}

export default function SightseeingBanner({ tours }: SightseeingBannerProps) {
  if (!tours || tours.length === 0) return null;

  // Collect all available photos from tours
  const allPhotos: { url: string; tourName: string; city: string }[] = [];

  tours.forEach(tour => {
    if (tour.photo_url_1) {
      allPhotos.push({ url: tour.photo_url_1, tourName: tour.tour_name, city: tour.city });
    }
    if (tour.photo_url_2) {
      allPhotos.push({ url: tour.photo_url_2, tourName: tour.tour_name, city: tour.city });
    }
    if (tour.photo_url_3) {
      allPhotos.push({ url: tour.photo_url_3, tourName: tour.tour_name, city: tour.city });
    }
  });

  // Smart selection: Ensure at least 1 photo from each city
  const displayPhotos: { url: string; tourName: string; city: string }[] = [];
  const citiesUsed = new Set<string>();

  // First pass: Get one photo from each unique city
  for (const photo of allPhotos) {
    if (!citiesUsed.has(photo.city)) {
      displayPhotos.push(photo);
      citiesUsed.add(photo.city);
      if (displayPhotos.length >= 4) break;
    }
  }

  // Second pass: Fill remaining slots (up to 4) with additional photos
  if (displayPhotos.length < 4) {
    for (const photo of allPhotos) {
      if (!displayPhotos.includes(photo)) {
        displayPhotos.push(photo);
        if (displayPhotos.length >= 4) break;
      }
    }
  }

  if (displayPhotos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
      {displayPhotos.map((photo, index) => (
        <div
          key={index}
          className="relative aspect-square overflow-hidden rounded-xl shadow-lg group"
        >
          <img
            src={photo.url}
            alt={photo.tourName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ESightseeing%3C/text%3E%3C/svg%3E';
            }}
          />
          {/* Always visible city label */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white text-lg md:text-xl font-bold drop-shadow-lg">
                {photo.city}
              </h3>
            </div>
          </div>
          {/* Hover overlay with tour details */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-center px-4">
              <p className="text-white text-sm font-semibold line-clamp-2">{photo.tourName}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
