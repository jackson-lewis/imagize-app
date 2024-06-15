import Stripe from 'stripe'

const stripe: Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export async function POST(request: Request) {
  const data = await request.json()

  const customer = await stripe.customers.create({
    email: data.email,
    name: data.name,
    shipping: {
      address: {
        city: 'Brothers',
        country: 'US',
        line1: '27 Fredrick Ave',
        // eslint-disable-next-line camelcase
        postal_code: '97712',
        state: 'CA'
      },
      name: data.name
    },
    address: {
      city: 'Brothers',
      country: 'US',
      line1: '27 Fredrick Ave',
      // eslint-disable-next-line camelcase
      postal_code: '97712',
      state: 'CA'
    }
  })

  return Response.json({
    customerId: customer.id
  })
}