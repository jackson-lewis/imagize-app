import { getAccount, getApiKey, incrementCredit } from '@/lib/firebase'
import sharp from 'sharp'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const format = searchParams.get('format') || 'webp'
  let quality: number = Number(searchParams.get('quality')) || 0

  if (!url) {
    return new Response('Error: no image url provided', {
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

  const imageRes = await fetch(url)

  if (!imageRes.ok) {
    return new Response('Error: could not fetch image', {
      status: 400
    })
  }

  const buffer = Buffer.from(await imageRes.arrayBuffer())
  
  const image = sharp(buffer)

  if (format === 'avif') {
    const avifQuality = quality - 15

    image.avif({
      quality: Math.max(avifQuality, 0),
      chromaSubsampling: '4:2:0', // same as webp
      effort: 1
    })
  } else if (format === 'webp') {
    image.webp({
      quality: options.quality
    })
  } else if (format === 'jpeg') {
    image.jpeg({
      quality: options.quality
    })
  } else if (format === 'png') {
    image.png({
      quality: options.quality
    })
  }

  // incrementCredit(account.id, account.data)

  return new Response(await image.toBuffer(), {
    headers: {
      'Content-Type': `image/${format}`,
      'Cache-Control': 'public, max-age=3600, must-revalidate'
    }
  })
}
