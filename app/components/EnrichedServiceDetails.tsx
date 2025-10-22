import React from 'react';

interface EnrichedServiceDetailsProps {
  enrichedDays: any[];
  dayNumber: number;
}

export default function EnrichedServiceDetails({ enrichedDays, dayNumber }: EnrichedServiceDetailsProps) {
  const enrichedDay = enrichedDays.find((ed: any) => ed.dayNumber === dayNumber);

  if (!enrichedDay) return null;

  return (
    <div className="mt-6 space-y-6">
      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">📍 Service Details with Photos</h4>

        {/* Enriched Accommodations */}
        {enrichedDay.accommodations && enrichedDay.accommodations.length > 0 && enrichedDay.accommodations.map((acc: any, idx: number) => (
          <div key={idx} className="bg-white border-2 border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-4">
              {/* Hotel Photos */}
              {acc.images && acc.images.length > 0 && (
                <div className="flex-shrink-0 w-48">
                  <img
                    src={acc.images[0]}
                    alt={acc.name}
                    className="w-full h-32 object-cover rounded-lg shadow"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {acc.images.length > 1 && (
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      +{acc.images.length - 1} more photos
                    </div>
                  )}
                </div>
              )}

              {/* Hotel Details */}
              <div className="flex-grow">
                <h5 className="font-semibold text-green-900 text-lg">
                  🏨 {acc.name}
                  {acc.starRating && (
                    <span className="ml-2 text-yellow-500">
                      {'⭐'.repeat(acc.starRating)}
                    </span>
                  )}
                </h5>
                {acc.address && (
                  <p className="text-sm text-gray-600 mt-1">📍 {acc.address}</p>
                )}
                {acc.phone && (
                  <p className="text-sm text-gray-600">📞 {acc.phone}</p>
                )}
                {acc.description && (
                  <p className="text-sm text-gray-700 mt-2">{acc.description}</p>
                )}
                {acc.amenities && acc.amenities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {acc.amenities.slice(0, 5).map((amenity: string, i: number) => (
                      <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Enriched Activities */}
        {enrichedDay.activities && enrichedDay.activities.length > 0 && enrichedDay.activities.map((act: any, idx: number) => (
          <div key={idx} className="bg-white border-2 border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-4">
              {/* Activity Photos */}
              {act.images && act.images.length > 0 && (
                <div className="flex-shrink-0 w-48">
                  <img
                    src={act.images[0]}
                    alt={act.name}
                    className="w-full h-32 object-cover rounded-lg shadow"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {act.images.length > 1 && (
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      +{act.images.length - 1} more photos
                    </div>
                  )}
                </div>
              )}

              {/* Activity Details */}
              <div className="flex-grow">
                <h5 className="font-semibold text-blue-900 text-lg">
                  🎯 {act.name}
                </h5>
                {act.category && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {act.category}
                  </span>
                )}
                {act.description && (
                  <p className="text-sm text-gray-700 mt-2">{act.description}</p>
                )}
                {act.meetingPoint && (
                  <p className="text-sm text-gray-600 mt-1">📍 Meeting Point: {act.meetingPoint}</p>
                )}
                {act.duration && (
                  <p className="text-sm text-gray-600">⏱️ Duration: {act.duration} hours</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Enriched Restaurants */}
        {enrichedDay.restaurants && enrichedDay.restaurants.length > 0 && enrichedDay.restaurants.map((rest: any, idx: number) => (
          <div key={idx} className="bg-white border-2 border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-4">
              {/* Restaurant Photos */}
              {rest.images && rest.images.length > 0 && (
                <div className="flex-shrink-0 w-48">
                  <img
                    src={rest.images[0]}
                    alt={rest.name}
                    className="w-full h-32 object-cover rounded-lg shadow"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {rest.images.length > 1 && (
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      +{rest.images.length - 1} more photos
                    </div>
                  )}
                </div>
              )}

              {/* Restaurant Details */}
              <div className="flex-grow">
                <h5 className="font-semibold text-orange-900 text-lg">
                  🍽️ {rest.name}
                </h5>
                {rest.cuisineType && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    {rest.cuisineType}
                  </span>
                )}
                {rest.address && (
                  <p className="text-sm text-gray-600 mt-1">📍 {rest.address}</p>
                )}
                {rest.phone && (
                  <p className="text-sm text-gray-600">📞 {rest.phone}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Enriched Guides */}
        {enrichedDay.guides && enrichedDay.guides.length > 0 && enrichedDay.guides.map((guide: any, idx: number) => (
          <div key={idx} className="bg-white border-2 border-indigo-200 rounded-lg p-4 mb-4">
            <h5 className="font-semibold text-indigo-900 text-lg">
              👨‍🏫 {guide.name}
            </h5>
            {guide.specialization && (
              <p className="text-sm text-gray-700 mt-1">Specialization: {guide.specialization}</p>
            )}
            {guide.languages && guide.languages.length > 0 && (
              <p className="text-sm text-gray-600">Languages: {guide.languages.join(', ')}</p>
            )}
            {guide.phone && (
              <p className="text-sm text-gray-600">📞 {guide.phone}</p>
            )}
          </div>
        ))}

        {/* Enriched Transports */}
        {enrichedDay.transports && enrichedDay.transports.length > 0 && enrichedDay.transports.map((trans: any, idx: number) => (
          <div key={idx} className="bg-white border-2 border-purple-200 rounded-lg p-4 mb-4">
            <h5 className="font-semibold text-purple-900 text-lg">
              🚗 {trans.name}
            </h5>
            {trans.type && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {trans.type}
              </span>
            )}
            {trans.vehicleType && (
              <p className="text-sm text-gray-700 mt-1">Vehicle: {trans.vehicleType}</p>
            )}
            {trans.capacity && (
              <p className="text-sm text-gray-600">Capacity: {trans.capacity} passengers</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
