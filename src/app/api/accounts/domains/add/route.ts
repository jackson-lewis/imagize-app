import { addDomain, getAccount, getApiKey } from '@/lib/firebase'

export async function POST(request: Request) {
  let {
    domain
  }: {
    domain: string
  } = await request.json()
  const apiKey = getApiKey(request)

  if (!apiKey) {
    return new Response('Error: api key not set', {
      status: 400
    })
  }

  if (!domain) {
    return new Response('Error: no domain provided', {
      status: 400
    })
  }

  const account = await getAccount(apiKey)

  if (!account) {
    return new Response('Error: account not found', {
      status: 400
    })
  }

  await addDomain(domain, account.id, account.data)
}
