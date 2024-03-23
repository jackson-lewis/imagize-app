import { usageLimitReached, getAccount, getApiKey, logUsage } from '@/lib/firebase'
import { VertexAI } from '@google-cloud/vertexai'


export async function POST(request: Request) {
  let {
    url
  }: {
    url: string
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

  const keys = process.env.GCLOUD_SA_KEYS || ''

  const vertex = new VertexAI({
    project: projectId,
    location: 'us-central1',
    googleAuthOptions: {
      credentials: JSON.parse(keys)
    }
  })

  const imageTextModel = vertex.getGenerativeModel({
    model: 'imagetext'
  })

  try {
    const res = await imageTextModel.generateContentStream({
      contents: [
        {
          role: 'user',
          parts: [
            {
              // eslint-disable-next-line camelcase
              inline_data: {
                data: base64Image,
                // eslint-disable-next-line camelcase
                mime_type: 'image/jpeg'
              }
            }
          ]
        }
      ]
    })
  
    const contentResponse = await res.response
    console.log(contentResponse.candidates[0].content.parts[0].text)
  
    await logUsage(apiKey, hostname, 'ai')

    return Response.json({
      altText: true
    })
  } catch (error) {
    console.error(error)
    
    return Response.json({
      error: {
        code: 1,
        message: 'Internal server error.'
      },
      altText: ''
    }, {
      status: 400
    })
  }
}
