import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Image from "../Image.jsx";

export default function IndexPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/places')
      .then(response => {
        setPlaces(response.data || []);
        setLoading(false);
      })
      .catch(() => {
        setPlaces([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mt-8">
      {loading && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">Discovering beautiful places to stay...</p>
        </div>
      )}

      {!loading && places.length === 0 && (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No places listed yet</h2>
          <p className="text-gray-500">Be the first host to share your space!</p>
        </div>
      )}

      <div className="grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {places.length > 0 && places.map(place => (
          <Link to={'/place/' + place._id} key={place._id} className="group">
            <div className="bg-gray-200 mb-3 rounded-2xl flex overflow-hidden aspect-square">
              {place.photos?.[0] ? (
                <Image className="rounded-2xl object-cover w-full h-full group-hover:scale-105 transition duration-200" src={place.photos[0]} alt={place.title} />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  No Image Available
                </div>
              )}
            </div>
            <h2 className="font-bold text-gray-800 truncate">{place.address}</h2>
            <h3 className="text-sm text-gray-500 truncate">{place.title}</h3>
            <div className="mt-1">
              <span className="font-bold text-gray-900">${place.price}</span> <span className="text-gray-500 text-sm">per night</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
