import { isEmailAvailable } from '@/lib/firebase'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const data = await req.json()
  const email = data.email

  if (!email) {
    return Response.json({
      error: 'No email provided.'
    }, { status: 403 })
  }

  const available = await isEmailAvailable(email)

  return Response.json({
    available
  })
}