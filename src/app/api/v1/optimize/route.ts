import { usageLimitReached, getAccount, getApiKey, logUsage, logStats } from '@/lib/firebase/account'
import sharp from 'sharp'
import { Storage } from '@google-cloud/storage'
import { ImageContentTypes } from '@/lib/types'

const gcloudKeys = process.env.GCLOUD_SA_KEYS || ''

const storage = new Storage({
  projectId: process.env.FIREBASE_PROJECT_ID,
  credentials: JSON.parse(gcloudKeys)
})


export async function POST(request: Request) {
  let {
    url,
    quality = 70,
    buffer,
    contentType,
    size = 0,
    domain = '',
    filepath = ''
  }: {
    url: string,
    quality: number,
    buffer: Buffer,
    contentType: ImageContentTypes,
    size: number
    domain: string,
    filepath: string
  } = await request.json()
  const apiKey = getApiKey(request)

  if (!apiKey) {
    return new Response('Error: api key not set', {
      status: 400
    })
  }

  if (!url && !buffer) {
    return new Response('Error: no image url or buffer provided', {
      status: 400
    })
  }

  const account = await getAccount(apiKey)

  if (!account) {
    return new Response('Error: account not found', {
      status: 400
    })
  }

  if (await usageLimitReached(account, 'optimize')) {
    return new Response('Error: no credits available', {
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
    contentType = imageRes.headers.get('Content-Type') as ImageContentTypes
  }

  if (url) {
    const { hostname, pathname } = new URL(url)

    domain = hostname
    filepath = pathname.replace(/^\//, '')
  }

  if (process.env.VERCEL) {
    const originalsBucket = storage.bucket('original-image-backups')
    await originalsBucket.file(`${apiKey}/${domain}/${filepath}`).save(buffer, {
      contentType
    })
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

  await logUsage(apiKey, domain, 'optimize')

  const optBuffer = await image.toBuffer()

  const stats = {
    original: size || buffer.byteLength,
    optimized: optBuffer.byteLength
  }

  console.log(`Image optimized from ${stats.original} to ${stats.optimized}`)

  logStats(apiKey, domain, stats.original, stats.optimized)

  return new Response(optBuffer, {
    headers: {
      'Content-Type': contentType
    }
  })
}
