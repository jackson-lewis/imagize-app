import { getAccount, incrementCredit } from '@/lib/firebase'
import sharp from 'sharp'

export async function POST(request: Request) {
  let {
    url,
    quality = 70,
    buffer,
    contentType
  } = await request.json()
  const apiKey = request.headers.get('authorization')?.replace(/^Bearer\s/, '')

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

  /**
   * Don't allow quality to come through as 0
   */
  if (quality === 0) {
    quality = 70
  }

  const options = {
    quality
  }

  if (url) {
    const imageRes = await fetch(url)

    if (!imageRes.ok) {
      return new Response('Error: could not fetch image', {
        status: 400
      })
    }

    buffer = Buffer.from(await imageRes.arrayBuffer())

    contentType = imageRes.headers.get('Content-Type')
  }
  
  const image = sharp(buffer)

  if (contentType === 'image/jpeg') {
    image.jpeg({
      quality: options.quality
    })
  } else if (contentType === 'image/png') {
    image.png({
      quality: options.quality
    })
  }

  incrementCredit(account.id, account.data)

  return new Response(await image.toBuffer(), {
    headers: {
      'Content-Type': contentType
    }
  })
}
