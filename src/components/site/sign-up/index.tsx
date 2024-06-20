'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './style.module.scss'
import { PlanObject } from '@/lib/types'
import CustomerDetails from './customer-details'
import SelectPlan from './select-plan'
import Payment from './payment'

export type SignUpFormSteps = 'details' | 'choose_plan' | 'payment'

export default function SignUpForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [clientSecret, setClientSecret] = useState('')
  const [step, setStep] = useState<SignUpFormSteps>('details')
  const [plans, setPlans] = useState<PlanObject[]>([])
  const [stripeCustomerId, setStripeCustomerId] = useState('')

  useEffect(() => {
    async function fetchPlans() {
      await fetch('/api/~/plans')
        .then(res => {
          if (!res.ok) {
            throw new Error('Error fetching plans.')
          }

          return res.json()
        })
        .then((data: PlanObject[]) => {
          setPlans(data)
        })
    }

    fetchPlans()
  }, [])

  return (
    <form className={styles.form} ref={formRef}>
      <CustomerDetails
        formRef={formRef}
        setStripeCustomerId={setStripeCustomerId}
        step={step}
        setStep={setStep}
      />
      <SelectPlan
        plans={plans}
        step={step}
        setStep={setStep}
        stripeCustomerId={stripeCustomerId}
        setClientSecret={setClientSecret}
      />
      <Payment
        formRef={formRef}
        step={step}
        setStep={setStep}
        clientSecret={clientSecret}
      />
    </form>
  )
}