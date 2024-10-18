'use client'

import Price from '@/components/global/price'
import { PlanObject } from '@/lib/types'
import { useState } from 'react'

export default function Plans({ data }: { data: PlanObject[] }) {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  
  return (
    <div>
      <button 
        onClick={() => setInterval('monthly')}
      >
        Monthly
      </button>
      <button 
        onClick={() => setInterval('yearly')}
      >
        Yearly
      </button>
      {data.map(plan => (
        <div key={plan.name}>
          <h3>{plan.name}</h3>
          <Price amount={plan.price[interval].amount} />
          <ul>
            {plan.marketing_features.map((feature, index) => (
              <li key={`ft-${index}`}>{feature}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}