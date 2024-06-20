import { Account, Plans } from '@/lib/types'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Dispatch, RefObject, SetStateAction } from 'react'
import { SignUpFormSteps } from '..'

export default function StripeCheckout({
  formRef,
  setStep
}: {
  formRef: RefObject<HTMLFormElement>
  setStep: Dispatch<SetStateAction<SignUpFormSteps>>
}) {
  const stripe = useStripe();
  const elements = useElements();

  async function handleSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    const form = formRef.current

    if (!form) {
      return false
    }

    const res = await fetch('/api/v1/accounts/create', {
      method: 'post',
      body: JSON.stringify({
        email: form.email.value as string,
        name: form.first_name.value as string,
        plan: form.plan.value as Plans
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

    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    const origin = vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3010'

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // eslint-disable-next-line camelcase
        return_url: `${origin}/dashboard?action=welcome`,
      },
    });
  }

  return (
    <>
      <PaymentElement />
      <button type="button" onClick={() => {setStep('choose_plan')}}>Back</button>
      <button onClick={handleSubmit}>Sign up</button>
    </>
  )
}