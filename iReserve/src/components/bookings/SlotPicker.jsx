// Slot Picker component for selecting available time slots for bookings.
import React, { useState, useEffect } from 'react';
import './SlotPicker.css';

const SlotPicker = ({ availableSlots, onSelectSlot }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    onSelectSlot(slot);
  };

  return (
    <div className="slot-picker">
      {availableSlots.map((slot) => (
        <button
          key={slot}
          className={`slot-button ${selectedSlot === slot ? 'selected' : ''}`}
          onClick={() => handleSlotClick(slot)}
        >
          {slot}
        </button>
      ))}
    </div>
  );
};

export default SlotPicker;