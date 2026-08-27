// Payment Status Modal component
import React from 'react';
import './PaymentStatusModal.css';

const PaymentStatusModal = ({ isOpen, status, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="payment-status-modal">
      <div className="modal-content">
        <h2>Payment Status</h2>
        <p>{status}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default PaymentStatusModal;