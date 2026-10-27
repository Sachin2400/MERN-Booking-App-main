import { Link } from "react-router-dom";
import AccountNav from "../AccountNav.jsx";
import { useEffect, useState } from "react";
import PlaceImg from "../PlaceImg";
import axios from "axios";

export default function PlacesPage() {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/user-places')
            .then(({ data }) => {
                setPlaces(data || []);
                setLoading(false);
            })
            .catch(() => {
                setPlaces([]);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <AccountNav />
            <div className="text-center">
                <Link className="bg-primary text-white py-2 px-6 rounded-full inline-flex gap-1 items-center shadow-md hover:opacity-90 transition" to={'/account/places/new'}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                    </svg>
                    Add new place
                </Link>
            </div>

            <div className="mt-6 flex flex-col gap-4 max-w-4xl mx-auto">
                {loading && <p className="text-center text-gray-500">Loading your listings...</p>}
                {!loading && places.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500 mb-2">You haven't listed any accommodations yet.</p>
                        <p className="text-sm text-gray-400">Click the button above to host your first place!</p>
                    </div>
                )}
                {places.length > 0 && places.map(place => (
                    <Link
                        key={place._id}
                        to={'/account/places/' + place._id}
                        className="flex cursor-pointer gap-4 bg-gray-100 p-4 rounded-2xl hover:bg-gray-200 transition"
                    >
                        <div className="flex w-32 h-32 grow shrink-0 rounded-xl overflow-hidden bg-gray-300">
                            <PlaceImg className="object-cover w-full h-full" place={place} />
                        </div>
                        <div className="grow-0 shrink">
                            <h2 className="text-xl font-bold text-gray-800">{place.title}</h2>
                            <p className="text-sm mt-2 text-gray-600 line-clamp-3">{place.description}</p>
                            <p className="text-sm mt-3 font-semibold text-primary">${place.price} per night</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
