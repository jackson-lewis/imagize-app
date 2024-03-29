import { getAccount, getApiKey } from '@/lib/firebase'

export async function GET(request: Request) {
  const apiKey = getApiKey(request)

  if (!apiKey) {
    return new Response('Error: api key not set', {
      status: 400
    })
  }

  const account = await getAccount(apiKey)

  if (!account) {
    return new Response('Error: account not found', {
      status: 400
    })
  }

  return Response.json(account)
}
