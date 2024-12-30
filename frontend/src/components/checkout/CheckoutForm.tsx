"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    if (!stripe || !elements) {
      setError("Stripe.js has not loaded yet.");
      setLoading(false);
      return;
    }

    try {
      // Call the backend to create a PaymentIntent
      const response = await fetch("http://127.0.0.1:5000/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: parseInt(amount, 10) * 100 }), // Convert to cents
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create PaymentIntent");
      }

      const { clientSecret } = data;

      // Confirm the PaymentIntent with the card details
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email },
        },
      });

      if (result.error) {
        setError(result.error.message || "Payment failed.");
      } else if (result.paymentIntent?.status === "succeeded") {
        alert("Payment succeeded!");
        window.location.href = "/checkout/success";
      } else if (result.paymentIntent?.status === "requires_payment_method") {
        setError("Payment failed. Please try again with a valid payment method.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white shadow-xl rounded-lg">
      <h1 className="text-3xl font-extrabold mb-6 text-center">Secure Checkout</h1>
      <p className="text-sm mb-6 text-center">
        Enter your details below to complete your payment securely.
      </p>
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Email</label>
        <input
          type="email"
          className="w-full rounded-lg border-none p-3 shadow-inner text-gray-900"
          value={email}
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Amount ($)</label>
        <input
          type="number"
          className="w-full rounded-lg border-none p-3 shadow-inner text-gray-900"
          value={amount}
          placeholder="Enter amount"
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Card Details</label>
        <div className="p-3 rounded-lg bg-gray-100">
          <CardElement className="text-gray-900" />
        </div>
      </div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-blue-600 text-lg font-bold rounded-lg shadow-lg hover:from-purple-600 hover:to-blue-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <CheckoutForm />
      </div>
    </Elements>
  );
}
