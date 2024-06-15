'use client'

import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';

function CreditCardForm() {
  const elements = useElements();
  const stripe = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const onClick = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: "http://localhost:3000",
          //  return_url: "https://example.com/order/123/complete",
        },
        redirect: "if_required",
      });
      if (error) {
        throw error.message;
      }
      if (paymentIntent.status === "succeeded") {
        alert(
          "Payment success. The NFT will be delivered to your wallet shortly."
        );
        setIsCompleted(true);
      } else {
        alert("Payment failed. Please try again.");
      }
    } catch (e) {
      alert(`There was an error with the payment. ${e}`);
    }

    setIsLoading(false);
  };

  return (
    <>
      <PaymentElement />

      <button
        onClick={onClick}
        disabled={isLoading || isCompleted || !stripe || !elements} >
        {
          isCompleted
            ? "Payment received"
            : isLoading
              ? "Please wait..."
              : "Pay now"
        }
      </button>
    </>
  );
};

export default CreditCardForm
