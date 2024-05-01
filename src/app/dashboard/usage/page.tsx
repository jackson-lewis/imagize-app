import UsageChart from '@/components/dashboard/usage/chart'
import { getAccountData } from '@/lib/dashboard'
import { getAccountUsage } from '@/lib/firebase'

export default async function DashboardUsage() {
  const account = await getAccountData()

  if (!account) {
    return null
  }

  const usage = await getAccountUsage(account.key)

  return (
    <div>
      <h1>Usage</h1>
      <UsageChart usage={ usage } />
      <h2>Domains</h2>
      <p>This is the list of domains authorized on your account</p>
      {account.domains ? (
        <ul>
          {account.domains.map(domain => (
            <li key={domain}>{domain} <a href={`?remove-domain=${domain}`}>remove</a></li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}