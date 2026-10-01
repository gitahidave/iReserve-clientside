// Paystack Button component
import React from 'react';
import './PaystackButton.css';

const PaystackButton = ({ onClick }) => {
  return (
    <button className="paystack-button" onClick={onClick}>
      Pay with Paystack
    </button>
  );
};

export default PaystackButton;
