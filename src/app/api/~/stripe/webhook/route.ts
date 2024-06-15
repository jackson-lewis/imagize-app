import { updatePlan, updatePrice } from '@/lib/firebase-admin'
import Stripe from 'stripe'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature')
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(await request.text(), sig, endpointSecret)
  } catch (error: any) {
    console.log(error.message)
    return new Response(error.message, {
      status: 400
    })
  }

  console.log(event.type)

  switch (event.type) {
  case 'price.updated':
    const { id: priceId, unit_amount: unitAmount, product, recurring } = event.data.object

    if (recurring && typeof product === 'string' && unitAmount) {
      const { interval } = recurring

      if (interval === 'month' || interval === 'year') {
        await updatePrice(product, priceId, unitAmount, `${interval}ly`)
      }
    }
    break
  case 'product.updated':
    const { id, marketing_features: marketingFeatures, name } = event.data.object
    await updatePlan(id, {
      name,
      // eslint-disable-next-line camelcase
      marketing_features: marketingFeatures.map(feature => {
        return feature.name
      })
    })
    break
  }


  return new Response('ok')
}