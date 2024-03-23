import { LIMITS } from '@/lib/constants'
import { getAccount, getAccountUsage, getApiKey, getCurrentMonth } from '@/lib/firebase'
import { ServiceTypes, ServiceTypesUsage } from '@/lib/types'

export async function GET(request: Request) {
  const apiKey = getApiKey(request)

  if (!apiKey) {
    return new Response('Error: api key not set', {
      status: 400
    })
  }

  const account = await getAccount(apiKey)
  const usage = await getAccountUsage(apiKey)

  if (!account || !usage) {
    return new Response('Error: account not found', {
      status: 400
    })
  }

  const month = getCurrentMonth()
  const used: ServiceTypesUsage = usage[month]
  const limits: ServiceTypesUsage = LIMITS[account.plan]
  const available: ServiceTypesUsage = {
    optimize: 0,
    cdn: 0,
    ai: 0
  }

  ;(Object.keys(used) as Array<ServiceTypes>).forEach((type: ServiceTypes) => {
    available[type] = limits[type] - used[type]
  })

  const reqUsage = {
    used,
    limits,
    available
  }

  return Response.json(reqUsage)
}
