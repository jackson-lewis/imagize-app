import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function DashboardNav() {
  async function logout() {
    'use server'

    cookies().delete('accountKey')
    redirect('/?action=logout')
  }

  return (
    <nav>
      <ul>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link href="/dashboard/usage">Usage</Link>
        </li>
        <li>
          <Link href="/dashboard/settings">Settings</Link>
        </li>
        <li>
          <form action={logout}>
            <button>Log out</button>
          </form>
        </li>
      </ul>
    </nav>
  )
}