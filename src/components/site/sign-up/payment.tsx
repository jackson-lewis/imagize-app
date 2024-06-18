'use client'

import StripeCheckout from './stripe'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import styles from './style.module.scss'
import { Dispatch, RefObject, SetStateAction } from 'react'
import { SignUpFormSteps } from '.'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUB_KEY as string);

export default function Payment({
  formRef,
  step,
  setStep,
  clientSecret
}: {
  formRef: RefObject<HTMLFormElement>
  clientSecret: string
  step: SignUpFormSteps
  setStep: Dispatch<SetStateAction<SignUpFormSteps>>
}) {
  return (
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
  )
}