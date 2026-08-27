// Booking Modal component
import React, { useState } from 'react';
import BookingCalendar from './BookingCalendar';
import SlotPicker from './SlotPicker';
import './BookingModal.css';

const BookingModal = ({ bookings, availableSlots, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleConfirm = () => {
    if (selectedDate && selectedSlot) {
      onConfirm({ date: selectedDate, slot: selectedSlot });
    }
  };

  return (
    <div className="booking-modal">
      <div className="modal-content">
        <h2>Book a Slot</h2>
        <BookingCalendar bookings={bookings} onSelectDate={setSelectedDate} />
        {selectedDate && (
          <SlotPicker
            availableSlots={availableSlots}
            onSelectSlot={setSelectedSlot}
          />
        )}
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleConfirm} disabled={!selectedDate || !selectedSlot}>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;