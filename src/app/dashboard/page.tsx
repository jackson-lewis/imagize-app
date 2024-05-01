import { getAccountData } from '@/lib/dashboard'

export default async function Dashboard({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const account = await getAccountData()
  const action = searchParams.action

  if (!account) {
    return null
  }

  return (
    <div>
      {action === 'welcome' ? (
        <p>Welcome to imagize, {account.name}! Let&#39;s get started</p>
      ) : null}
      <h1>Dashboard</h1>
      <p>Hi, {account.name}</p>
    </div>
  )
}