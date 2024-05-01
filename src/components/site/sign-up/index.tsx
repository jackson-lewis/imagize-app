'use client'

import { useRef, useState } from 'react'
import StripeCheckout from './stripe'
import styles from './style.module.scss'
import { Plans } from '@/lib/types'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUB_KEY as string);

export default function SignUpForm() {
  const formRef = useRef(null)
  const [selectedPlan, setSelectedPlan] = useState<Plans>('free')
  const [clientSecret, setClientSecret] = useState('')

  async function customerDetails(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    const form = formRef.current as HTMLFormElement | null

    if (!form) {
      return
    }

    const emailAvailable = await fetch('/api/~/validate-signup-email', {
      method: 'post',
      body: JSON.stringify({
        email: form.email.value
      })
    })
      .then(res => res.json())
      .then((data: { available: boolean }) => {
        return data.available
      })

    console.log(emailAvailable)

    if (!emailAvailable) {
      alert('Email address is already used.')
    }
  }

  function selectPlan(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    fetch('/api/~/stripe/create-payment-intent', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ plan: selectedPlan }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }

  function handleSelectPlan(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedPlan(event.target.value as Plans)
  }

  return (
    <form className={styles.form} ref={formRef}>
      <fieldset className={styles.fieldset}>
        <input type="text" name="first_name" placeholder="First Name" required />
        <input type="text" name="last_name" placeholder="Last Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <input type="tel" name="phone" placeholder="Phone" />
        <input type="text" name="company" placeholder="Company" />
        <input type="password" name="password" placeholder="Password" />
        <input type="password" name="password2" placeholder="Confirm password" />
        <button type="button" onClick={customerDetails}>Select plan</button>
      </fieldset>
      <fieldset>
        <div>
          <input
            type="radio"
            name="plan"
            value="free"
            id="plan_free"
            checked={selectedPlan === 'free'}
            onChange={handleSelectPlan}
          />
          <label htmlFor="plan_free">Free</label>
        </div>
        <div>
          <input
            type="radio"
            name="plan"
            value="pro"
            id="plan_pro"
            checked={selectedPlan === 'pro'}
            onChange={handleSelectPlan}
          />
          <label htmlFor="plan_pro">Pro</label>
        </div>
        <div>
          <input
            type="radio"
            name="plan"
            value="enterprise"
            id="plan_enterprise"
            checked={selectedPlan === 'enterprise'}
            onChange={handleSelectPlan}
          />
          <label htmlFor="plan_enterprise">Enterprise</label>
        </div>
        <button onClick={selectPlan}>Payment</button>
      </fieldset>
      <fieldset>
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripeCheckout formRef={formRef} />
          </Elements>
        ) : null}
      </fieldset>
    </form>
  )
}