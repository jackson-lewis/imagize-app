import UsageChart from '@/components/dashboard/usage/chart'
import Domains from '@/components/dashboard/usage/domains'
import { getAccountData } from '@/lib/dashboard'
import { getAccountUsage } from '@/lib/firebase'

export default async function DashboardUsage() {
  const account = await getAccountData()

  if (!account) {
    return <p>Account not found.</p>
  }

  const usage = await getAccountUsage(account.key)

  return (
    <div>
      <h1>Usage</h1>
      <UsageChart usage={usage} />
      <Domains account={account} />
    </div>
  )
}