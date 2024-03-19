import { accountLimitReached, getAccount, getApiKey, incrementCredit } from '@/lib/firebase'
import sharp from 'sharp'
import path from 'path'
import { Storage } from '@google-cloud/storage'
import { ImageContentTypes } from '@/lib/types'

const storage = new Storage({
  projectId: process.env.FIREBASE_PROJECT_ID
})

export async function POST(request: Request) {
  let {
    url,
    quality = 70,
    buffer,
    contentType
  }: {
    url: string,
    quality: number,
    buffer: Buffer,
    contentType: ImageContentTypes
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

  if (accountLimitReached(account)) {
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

  const filename = path.basename(url)

  const originalsBucket = storage.bucket('original-image-backups')
  await originalsBucket.file(filename).save(buffer, {
    contentType
  })
  
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

  await incrementCredit('optimize', account.id, account.data)

  return new Response(await image.toBuffer(), {
    headers: {
      'Content-Type': contentType
    }
  })
}
