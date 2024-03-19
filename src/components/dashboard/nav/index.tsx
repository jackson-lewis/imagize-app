import Link from 'next/link'

export default function DashboardNav() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/dashboard/account">Account</Link>
        </li>
        <li>
          <Link href="/dashboard/usage">Usage</Link>
        </li>
        <li>
          <Link href="/dashboard/settings">Settings</Link>
        </li>
      </ul>
    </nav>
  )
}