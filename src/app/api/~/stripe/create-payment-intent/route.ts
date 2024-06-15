import { getPlans } from '@/lib/firebase-site'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'

const stripe: Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export async function POST(request: NextRequest) {
  const data: {
    planId: string
    billingInterval: 'monthly' | 'yearly'
  } = await request.json()
  const plans = await getPlans()

  if (!plans) {
    return new Response('Error fetching plans.', {
      status: 403
    })
  }

  const plan = plans.find(plan => {
    return plan.id === data.planId
  })

  if (!plan) {
    return new Response('Plan not found.', {
      status: 403
    })
  }

  const amount = plan.price[data.billingInterval].amount

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