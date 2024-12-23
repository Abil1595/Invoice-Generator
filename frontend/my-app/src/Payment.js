import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';

const Payment = ({ totalAmount,setGrandTotal }) => {  // Accept setTotalAmount as a prop
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const {isAuthenticated}=useSelector((state)=>state.authState)
  const navigate=useNavigate()
  // Create Razorpay Order
  const createOrder = async () => {
    try {
      const response = await axios.post('http://localhost:4500/create-order', { amount: totalAmount });
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      return null;
    }
  };

  // Handle Payment via Razorpay
  const handlePayment = async (event) => {
    event.preventDefault();
    if(!isAuthenticated)
    {
      alert('Please login to proceed payment');
      navigate('/login')
      return
    }
   
    
    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    const order = await createOrder();

    if (!order) {
      setLoading(false);
      setPaymentStatus("Failed to create order");
      return;
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Your Razorpay key ID
      amount: order.amount, // Amount in paise
      currency: 'INR',
      name: 'Electric and Tech World',
      description: 'Payment for invoice',
      order_id: order.id,
      handler: async function (response) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
        try {
          const verifyResponse = await axios.post('http://localhost:4500/verify-payment', {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
          });
          setPaymentStatus('Payment verified successfully');
          setGrandTotal(0)
          // Reset the totalAmount to 0 after successful payment
          // Reset the totalAmount

        } catch (error) {
          setPaymentStatus('Payment verification failed');
          console.error('Payment verification error:', error);
        }
      },
      prefill: {
        name: 'Abilash',
        email: 'abilash159506@gmail.com',
        contact: '87654567789',
      }, 
      theme: { 
        color: 'skyblue',
      },
    };

    // Use Razorpay as a function, not a constructor
    const razorpay = new window.Razorpay(options);
    razorpay.open();

    setLoading(false);
  };

  return (
    <div>
      <h2>Payment for Invoice</h2>
      <form onSubmit={handlePayment}>
        <div>
          <label>Amount (INR):</label>
          <input
            type="number"
            value={totalAmount} // Use the totalAmount prop directly
            onChange={(e) => {}}
            disabled
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing Payment...' : 'Pay Now'}
        </button>
      </form>
      {paymentStatus && <p>{paymentStatus}</p>}
    </div>
  );
};

export default Payment;
