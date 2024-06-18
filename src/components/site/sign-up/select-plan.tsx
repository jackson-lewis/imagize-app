'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import styles from './style.module.scss'
import type { SignUpFormSteps } from '.'
import { PlanObject, Plans } from '@/lib/types'


export default function SelectPlan({
  plans,
  stripeCustomerId,
  step,
  setStep,
  setClientSecret
}: {
  plans: PlanObject[]
  stripeCustomerId: string
  step: SignUpFormSteps
  setStep: Dispatch<SetStateAction<SignUpFormSteps>>
  setClientSecret: Dispatch<SetStateAction<string>>
}) {
  const [selectedPlan, setSelectedPlan] = useState<Plans>('free')

  function selectPlan(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    const plan = plans.find(plan => {
      return plan.id === selectedPlan
    })

    if (!plan) {
      throw new Error('Plan not found.')
    }

    fetch('/api/~/stripe/subscription', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerId: stripeCustomerId,
        priceId: plan.price.monthly.id
      })
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

  return (
    <fieldset
      name="choose_plan"
      disabled={step !== 'choose_plan'}
      className={styles.fieldset}
    >
      {plans.map(({ id, name }) => (
        <div key={id}>
          <input
            type="radio"
            name="plan"
            value={id}
            id={id}
            checked={selectedPlan === id}
            onChange={handleSelectPlan}
          />
          <label htmlFor={`plan_${id}`}>{name}</label>
        </div>
      ))}
      <button type="button" onClick={() => {setStep('details')}}>Back</button>
      <button type="button" onClick={selectPlan}>Payment</button>
    </fieldset>
  )
}