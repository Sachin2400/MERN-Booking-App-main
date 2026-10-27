import { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext.jsx";

export default function BookingWidget({ place }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [redirect, setRedirect] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  let numberOfNights = 0;
  if (checkIn && checkOut) {
    numberOfNights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
  }

  async function bookThisPlace() {
    if (!user) {
      alert("Please login first to reserve this accommodation.");
      navigate('/login');
      return;
    }
    if (!checkIn || !checkOut) {
      alert("Please select both check-in and check-out dates.");
      return;
    }
    if (numberOfNights <= 0) {
      alert("Check-out date must be after check-in date.");
      return;
    }
    if (!phone) {
      alert("Please provide your phone number.");
      return;
    }

    try {
      setBookingLoading(true);
      const response = await axios.post('/bookings', {
        checkIn, checkOut, numberOfGuests, name, phone,
        place: place._id,
        price: numberOfNights * place.price,
      });
      setBookingLoading(false);
      const bookingId = response.data._id;
      setRedirect(`/account/bookings/${bookingId}`);
    } catch (err) {
      setBookingLoading(false);
      alert(err.response?.data?.error || "Booking failed. Please try again.");
    }
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div className="bg-white shadow-xl p-6 rounded-2xl border border-gray-100">
      <div className="text-2xl font-bold text-center text-gray-800">
        ${place.price} <span className="text-base font-normal text-gray-500">/ night</span>
      </div>
      <div className="border border-gray-300 rounded-2xl mt-4 overflow-hidden">
        <div className="flex border-b border-gray-300">
          <div className="py-3 px-4 w-1/2">
            <label className="block text-xs font-bold uppercase text-gray-700">Check in:</label>
            <input
              type="date"
              className="w-full mt-1 outline-none text-sm bg-transparent"
              value={checkIn}
              onChange={ev => setCheckIn(ev.target.value)}
            />
          </div>
          <div className="py-3 px-4 w-1/2 border-l border-gray-300">
            <label className="block text-xs font-bold uppercase text-gray-700">Check out:</label>
            <input
              type="date"
              className="w-full mt-1 outline-none text-sm bg-transparent"
              value={checkOut}
              onChange={ev => setCheckOut(ev.target.value)}
            />
          </div>
        </div>
        <div className="py-3 px-4">
          <label className="block text-xs font-bold uppercase text-gray-700">Number of guests:</label>
          <input
            type="number"
            min={1}
            max={place.maxGuests || 10}
            className="w-full mt-1 outline-none text-sm bg-transparent"
            value={numberOfGuests}
            onChange={ev => setNumberOfGuests(Number(ev.target.value))}
          />
        </div>
        {numberOfNights > 0 && (
          <div className="py-3 px-4 border-t border-gray-300">
            <label className="block text-xs font-bold uppercase text-gray-700">Your full name:</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full mt-1 outline-none text-sm border p-2 rounded-lg"
              value={name}
              onChange={ev => setName(ev.target.value)}
            />
            <label className="block text-xs font-bold uppercase text-gray-700 mt-2">Phone number:</label>
            <input
              type="tel"
              placeholder="+1 234 567 890"
              className="w-full mt-1 outline-none text-sm border p-2 rounded-lg"
              value={phone}
              onChange={ev => setPhone(ev.target.value)}
            />
          </div>
        )}
      </div>

      <button
        onClick={bookThisPlace}
        disabled={bookingLoading}
        className="primary mt-4 w-full py-3 rounded-2xl font-bold text-lg shadow-md hover:opacity-95 transition disabled:opacity-50"
      >
        {bookingLoading ? "Processing Booking..." : `Book this place ${numberOfNights > 0 ? `($${numberOfNights * place.price})` : ''}`}
      </button>
    </div>
  );
}
