import { DocumentData } from 'firebase/firestore'

export type ImageContentTypes = `image/${'jpeg' | 'jpg' | 'png'}`

export type Plans = 'free' | 'pro'

export interface Account extends DocumentData {
  /**
   * The API key used to authenticate requests.
   */
  key: `i_${string}`
  /**
   * The account plan.
   */
  plan: Plans
  /**
   * The number of optimize credits already used in the calendar month.
   */
  optimizeCredits: number
  /**
   * The number of CDN credits already used in the calendar month.
   */
  cdnCredits: number
  /**
   * The number of AI credits already used in the calendar month.
   */
  aiCredits: number
  /**
   * List of domains authenticated with the account.
   */
  domains: string[]
}

export type CreditTypes = 'optimize' | 'cdn' | 'ai'
