import Plans from '@/components/site/plans'
import { getPlans } from '@/lib/firebase/site'

export default async function PricingPage() {
  const plans = await getPlans()

  if (!plans) {
    return null
  }

  return (
    <div>
      <h1>Pricing</h1>
      <Plans data={plans} />
    </div>
  )
}