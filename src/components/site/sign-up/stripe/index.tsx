import { Account, Plans } from '@/lib/types'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

export default function StripeCheckout({ formRef }: { formRef: any }) {
  const stripe = useStripe();
  const elements = useElements();

  async function handleSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    const data = new FormData(formRef.current)

    const res = await fetch('/api/v1/accounts/create', {
      method: 'post',
      body: JSON.stringify({
        email: data.get('email') as string,
        name: data.get('first_name') as string,
        plan: data.get('plan') as Plans
      })
    })

    if (!res.ok) {
      alert('Error creating account')
      return false
    }

    const key: Account['key'] = await res.json()
      .then(data => data.key)

    document.cookie = `accountKey=${key}`

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // eslint-disable-next-line camelcase
        return_url: 'http://localhost:3010/dashboard?action=welcome',
      },
    });
  }

  return (
    <>
      <PaymentElement />
      <button onClick={handleSubmit}>Sign up</button>
    </>
  )
}