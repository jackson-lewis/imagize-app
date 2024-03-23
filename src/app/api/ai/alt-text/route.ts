import { usageLimitReached, getAccount, getApiKey, logUsage } from '@/lib/firebase'

type Languages = 'en' | 'fr' | 'de' | 'it' | 'es'

export async function POST(request: Request) {
  const {
    url,
    sampleCount,
    language
  }: {
    url: string
    sampleCount: number
    language: Languages
  } = await request.json()
  const apiKey = getApiKey(request)

  if (!apiKey) {
    return new Response('Error: api key not set', {
      status: 400
    })
  }

  if (!url) {
    return new Response('Error: no image url provided', {
      status: 400
    })
  }

  const account = await getAccount(apiKey)

  if (!account) {
    return new Response('Error: account not found', {
      status: 400
    })
  }

  if (await usageLimitReached(account, 'ai')) {
    return new Response('Error: no credits available', {
      status: 400
    })
  }
  
  const { hostname } = new URL(url)
  const imageRes = await fetch(url)

  if (!imageRes.ok) {
    return new Response('Error: could not fetch image', {
      status: 400
    })
  }

  const base64Image = Buffer.from(await imageRes.arrayBuffer()).toString('base64')

  const projectId = process.env.FIREBASE_PROJECT_ID

  if (!projectId) {
    return new Response('Error: internal', {
      status: 400
    })
  }

  try {
    const location = 'us-central1'
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagetext:predict`

    const predictions = await fetch(url, {
      method: 'post',
      headers: {
        Authorization: `Bearer ${process.env.GCLOUD_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        instances: [
          {
            image: {
              bytesBase64Encoded: base64Image
            }
          }
        ],
        parameters: {
          sampleCount,
          language
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        return data.predictions
      })
  
    await logUsage(apiKey, hostname, 'ai')

    return Response.json({
      predictions
    })
  } catch (error) {
    console.error(error)

    return Response.json({
      error: {
        code: 1,
        message: 'Internal server error.'
      },
      predictions: []
    }, {
      status: 400
    })
  }
}
