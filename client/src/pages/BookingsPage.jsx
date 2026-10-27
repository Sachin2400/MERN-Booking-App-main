import AccountNav from "../AccountNav";
import { useEffect, useState } from "react";
import axios from "axios";
import PlaceImg from "../PlaceImg";
import { Link } from "react-router-dom";
import BookingDates from "../BookingDates";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/bookings')
      .then(response => {
        setBookings(response.data || []);
        setLoading(false);
      })
      .catch(() => {
        setBookings([]);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <AccountNav />
      <div className="max-w-4xl mx-auto flex flex-col gap-4 mt-6">
        {loading && <p className="text-center text-gray-500">Loading your reservations...</p>}
        {!loading && bookings?.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No active bookings found</h2>
            <p className="text-gray-500 mb-4">You have not booked any trips yet. Discover our top places to stay!</p>
            <Link to="/" className="inline-block bg-primary text-white py-2 px-6 rounded-full font-medium shadow hover:opacity-90 transition">
              Explore Destinations
            </Link>
          </div>
        )}
        {bookings?.length > 0 && bookings.map(booking => {
          const place = booking.place || {};
          return (
            <Link
              key={booking._id}
              to={`/account/bookings/${booking._id}`}
              className="flex flex-col sm:flex-row gap-4 bg-gray-100 rounded-2xl overflow-hidden hover:bg-gray-200 transition p-2 sm:p-0"
            >
              <div className="w-full sm:w-48 h-40 sm:h-auto shrink-0 bg-gray-300">
                <PlaceImg className="object-cover w-full h-full" place={place} />
              </div>
              <div className="py-3 px-4 grow">
                <h2 className="text-xl font-bold text-gray-800">{place.title || 'Reserved Accommodation'}</h2>
                <div className="text-xl">
                  <BookingDates booking={booking} className="mb-2 mt-3 text-gray-500 text-sm" />
                  <div className="flex items-center gap-1 mt-2 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                    <span className="text-2xl font-bold">
                      Total: ${booking.price}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
