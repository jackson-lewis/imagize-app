import { redirect } from 'next/navigation'

export default function Page() {
  async function signUp() {
    'use server'

    redirect('/dashboard')
  }

  return (
    <div>
      <h1>Sign up</h1>
      <form action={signUp}>
        <input type="text" name="name" placeholder="Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <input type="text" name="company" placeholder="Company" />
        <button>Sign up</button>
      </form>
    </div>
  )
}