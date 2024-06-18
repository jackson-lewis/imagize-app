import { getPlans } from '@/lib/firebase/site'

export async function GET() {
  const plans = await getPlans()

  if (!plans) {
    return new Response('Plans not found.', {
      status: 403
    })
  }

  return Response.json(plans)
}
