import { NextApiRequest, NextApiResponse } from "next";
import stripe from "stripe";

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2022-11-15",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, email } = req.body;

  if (!amount || !email) {
    return res.status(400).json({ error: "Amount and email are required" });
  }

  try {
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount,
      currency: "usd",
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
