import { getAccountData } from '@/lib/dashboard'

export default async function DashboardUsage() {
  const account = await getAccountData()

  if (!account) {
    return null
  }

  return (
    <div>
      <h1>Usage</h1>
      <table>
        <tbody>
          <tr>
            <td>Optimize</td>
            <td>{account.optimizeCredits}</td>
          </tr>
          <tr>
            <td>CDN</td>
            <td>{account.cdnCredits}</td>
          </tr>
          <tr>
            <td>AI</td>
            <td>{account.aiCredits}</td>
          </tr>
        </tbody>
      </table>
      <h2>Domains</h2>
      <p>This is the list of domains authorized on your account</p>
      <ul>
        {account.domains.map(domain => (
          <li key={domain}>{domain} <a href={`?remove-domain=${domain}`}>remove</a></li>
        ))}
      </ul>
    </div>
  )
}