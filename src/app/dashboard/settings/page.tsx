import SettingsForm from '@/components/dashboard/settings'
import { getAccountData } from '@/lib/dashboard'


export default async function DashboardSettings() {
  const account = await getAccountData()

  if (!account) {
    return <p>Error: Account not found.</p>
  }

  return (
    <>
      <h1>Settings</h1>
      <SettingsForm account={account} />
    </>
  )
}