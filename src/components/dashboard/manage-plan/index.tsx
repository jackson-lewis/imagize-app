'use client'

import { useFormState } from 'react-dom'
import { Account, PlanObject } from '@/lib/types'
import { useEffect, useState } from 'react'
import Price from '@/components/global/price'


export default function ManagePlan({ account }: { account: Account }) {
  async function cancelPlan() {
    if (account.plan === 'free') {
      return { success: false }
    }

    const success = await fetch('/api/~/stripe/subscription', {
      method: 'delete',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        subscriptionId: account.subscriptionId,
        accountKey: account.key
      })
    })
      .then(async (res) => {
        if (res.ok) {
          return false
        }

        return true
      })

    return { success }
  }

  const [state, action] = useFormState(cancelPlan, { success: false })
  const [plan, setPlan] = useState<PlanObject>()

  if (account.plan === 'pro') {
    account.subscriptionId
  }

  useEffect(() => {
    async function fetchPlans() {
      await fetch('/api/~/plans')
        .then(res => {
          if (!res.ok) {
            throw new Error('Error fetching plans.')
          }

          return res.json()
        })
        .then((plans: PlanObject[]) => {
          const plan = plans.find(plan => {
            return plan.id === account.plan
          })

          if (plan) {
            setPlan(plan)
          }
        })
    }

    fetchPlans()
  }, [account])

  if (!plan) {
    return <p>Error loading your plan.</p>
  }
  
  const billingStart = account.plan === 'pro' ? new Date(account.billingCycleDate.seconds * 1000) : new Date()

  return (
    <div>
      <h2>Manage your plan</h2>
      <div>
        <h3>{plan.name}</h3>
        {account.plan === 'pro' ? (
          <>
            <p>
              <Price amount={plan.price[account.billingCycle].amount} />
              {` per ${account.billingCycle === 'monthly' ? 'month' : 'year'}`}
            </p>
            <p>Joined: {billingStart.toLocaleDateString('en-GB')}</p>
            <button type="button">Change plan</button>
            <form action={action}>
              <button>Cancel my plan</button>
              {state.success ? (
                <p>Plan cancelled.</p>
              ) : null}
            </form>
          </>
        ) : (
          <button>Join Pro</button>
        )}
      </div>
    </div>
  )
}