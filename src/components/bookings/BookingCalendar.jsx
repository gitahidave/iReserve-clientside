// Booking Calendar Component
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './BookingCalendar.css';

const BookingCalendar = ({ bookings }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    // Extract booked dates from bookings prop
    const dates = bookings.map((booking) => new Date(booking.date));
    setBookedDates(dates);
  }, [bookings]);

  const tileDisabled = ({ date }) => {
    return bookedDates.some(
      (bookedDate) =>
        bookedDate.getFullYear() === date.getFullYear() &&
        bookedDate.getMonth() === date.getMonth() &&
        bookedDate.getDate() === date.getDate()
    );
  };

  return (
    <div className="booking-calendar">
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileDisabled={tileDisabled}
      />
    </div>
  );
};

export default BookingCalendar;