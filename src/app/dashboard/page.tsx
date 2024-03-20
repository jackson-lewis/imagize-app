import { getAccountData } from '@/lib/dashboard'

export default async function Dashboard() {
  const account = await getAccountData()

  if (!account) {
    return null
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Hi, {account.name}</p>
    </div>
  )
}