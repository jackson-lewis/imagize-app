import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default function Page() {
  async function login() {
    'use server'

    cookies().set('currentUser', 'jackson')
    redirect('/dashboard')
  }

  return (
    <div>
      <h1>Login</h1>
      <form action={login}>
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" />
        <button>Login</button>
      </form>
    </div>
  )
}