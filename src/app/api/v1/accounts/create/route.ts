import { createAccount } from '@/lib/firebase'

export async function POST(request: Request) {
  const data = await request.json()

  const key = await createAccount(data)

  return Response.json({
    key
  })
}
