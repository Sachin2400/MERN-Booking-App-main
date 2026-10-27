import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AddressLink from "../AddressLink";
import PlaceGallery from "../PlaceGallery";
import BookingDates from "../BookingDates";

export default function BookingPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      axios.get('/bookings')
        .then(response => {
          const foundBooking = response.data?.find(({ _id }) => _id === id);
          if (foundBooking) {
            setBooking(foundBooking);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <p className="text-center text-gray-500 my-10">Loading reservation details...</p>;
  }

  if (!booking) {
    return (
      <div className="text-center my-10">
        <h2 className="text-2xl font-bold text-gray-700">Booking Not Found</h2>
        <Link to="/account/bookings" className="text-primary underline mt-4 inline-block">
          &larr; Back to all bookings
        </Link>
      </div>
    );
  }

  const place = booking.place || {};

  return (
    <div className="my-8 max-w-4xl mx-auto">
      <Link to="/account/bookings" className="text-primary text-sm font-semibold inline-flex items-center gap-1 mb-4 hover:underline">
        &larr; Back to My Bookings
      </Link>
      <h1 className="text-3xl font-bold">{place.title || 'Accommodation Booking'}</h1>
      {place.address && <AddressLink className="my-2 block">{place.address}</AddressLink>}
      
      <div className="bg-gray-100 p-6 my-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gray-200">
        <div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Your Booking Details:</h2>
          <BookingDates booking={booking} className="text-gray-600 mb-2" />
          <p className="text-sm text-gray-500 mt-2">Booked by: <span className="font-medium text-gray-700">{booking.name}</span> ({booking.phone})</p>
        </div>
        <div className="bg-primary p-6 text-white rounded-2xl w-full md:w-auto text-center shadow-lg">
          <div className="text-sm font-semibold uppercase tracking-wider">Total Price Paid</div>
          <div className="text-3xl font-extrabold mt-1">${booking.price}</div>
        </div>
      </div>
      
      {place.photos?.length > 0 && <PlaceGallery place={place} />}
    </div>
  );
}
