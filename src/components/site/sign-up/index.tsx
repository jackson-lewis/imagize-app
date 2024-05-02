'use client'

import { useRef, useState } from 'react'
import StripeCheckout from './stripe'
import styles from './style.module.scss'
import { Plans } from '@/lib/types'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUB_KEY as string);

export type SignUpFormSteps = 'details' | 'choose_plan' | 'payment'

export default function SignUpForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plans>('free')
  const [clientSecret, setClientSecret] = useState('')
  const [step, setStep] = useState<SignUpFormSteps>('details')
  const [password1, setPassword1] = useState<string>('')
  const [password2, setPassword2] = useState<string>('')
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  })

  function validateStep(step: SignUpFormSteps) {
    const form = formRef.current

    if (!form) {
      return false
    }

    const fieldset: HTMLFieldSetElement = form[step]
    const invalidFields = Array.from(fieldset.querySelectorAll('input')).filter(input => {
      return !input.checkValidity()
    })
    let valid = invalidFields.length === 0

    if (step === 'details') {
      const failedValidations = Object.values(passwordValidations).filter(validation => {
        return !validation
      })

      if (failedValidations.length > 0) {
        valid = false
      }

      if (password1 !== password2) {
        valid = false
      }
    }

    if (!valid) {
      alert('Check your information and try again')
    }

    return valid
  }

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

    if (!emailAvailable) {
      alert('Email address is already used.')
      return
    }
    
    if (validateStep('details')) {
      setStep('choose_plan')
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
      .then((data) => {
        setClientSecret(data.clientSecret)
        setStep('payment')
      })
  }

  function handleSelectPlan(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedPlan(event.target.value as Plans)
  }

  function validatePassword(event: React.ChangeEvent<HTMLInputElement>) {
    const password = (event.target as HTMLInputElement).value
    setPassword1(password)

    const validations = {
      length: false,
      uppercase: false,
      number: false,
      special: false
    }

    // length
    if (password.length > 8) {
      validations.length = true
    }

    // uppercase
    if (/[A-Z]+/.test(password)) {
      validations.uppercase = true
    }

    // number
    if (/[0-9]+/.test(password)) {
      validations.number = true
    }

    // special
    if (/[!@£#$%^&*\(\)\.,\?]+/.test(password)) {
      validations.special = true
    }

    setPasswordValidations(validations)
  }

  function validatePasswordMatch(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword2((event.target as HTMLInputElement).value)
  }

  return (
    <form className={styles.form} ref={formRef}>
      <fieldset
        name="details"
        disabled={step !== 'details'}
        className={styles.fieldset}
      >
        <input type="text" name="first_name" placeholder="First Name" required />
        <input type="text" name="last_name" placeholder="Last Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <input type="tel" name="phone" placeholder="Phone" />
        <input type="text" name="company" placeholder="Company" />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={password1}
          onChange={validatePassword}
        />
        <div className={styles['password-validations']}>
          <span>length: {passwordValidations.length ? 'pass' : 'fail'}</span>
          <span>uppercase: {passwordValidations.uppercase ? 'pass' : 'fail'}</span>
          <span>number: {passwordValidations.number ? 'pass' : 'fail'}</span>
          <span>special: {passwordValidations.special ? 'pass' : 'fail'}</span>
        </div>
        <input
          type="password" 
          name="password2"
          placeholder="Confirm password"
          required
          value={password2}
          onChange={validatePasswordMatch}
        />
        <span>password match: {password1 === password2 ? 'pass' : 'fail'}</span>
        <button type="button" onClick={customerDetails}>Select plan</button>
      </fieldset>
      <fieldset
        name="choose_plan"
        disabled={step !== 'choose_plan'}
        className={styles.fieldset}
      >
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
        <button type="button" onClick={() => {setStep('details')}}>Back</button>
        <button type="button" onClick={selectPlan}>Payment</button>
      </fieldset>
      <fieldset
        name="payment"
        disabled={step !== 'payment'}
        className={styles.fieldset}
      >
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripeCheckout formRef={formRef} setStep={setStep} />
          </Elements>
        ) : null}
      </fieldset>
    </form>
  )
}