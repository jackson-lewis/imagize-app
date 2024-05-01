import { NextRequest } from 'next/server'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export async function POST(req: NextRequest) {
  let amount = 2500

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'gbp',
    // eslint-disable-next-line camelcase
    automatic_payment_methods: {
      enabled: true,
    },
  });

  console.log(paymentIntent.client_secret)

  return Response.json({
    clientSecret: paymentIntent.client_secret
  });
}