import Stripe from 'stripe'

const stripe: Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export async function POST(request: Request) {
  const data = await request.json()

  try {
    const { id, latest_invoice: latestInvoice } = await stripe.subscriptions.create({
      customer: data.customerId,
      items: [{
        price: data.priceId
      }],
      // eslint-disable-next-line camelcase
      payment_behavior: 'default_incomplete',
      // eslint-disable-next-line camelcase
      payment_settings: {
        // eslint-disable-next-line camelcase
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent']
    })
    let clientSecret: string | null = ''

    if (latestInvoice && typeof latestInvoice !== 'string') {
      if (latestInvoice?.payment_intent && typeof latestInvoice?.payment_intent !== 'string') {
        clientSecret = latestInvoice?.payment_intent?.client_secret
      }
    }

    return Response.json({
      subscriptionId: id,
      clientSecret
    })
  } catch (error: any) {
    return new Response(error.message, {
      status: 403
    })
  }
}