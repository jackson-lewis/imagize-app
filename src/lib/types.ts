import { DocumentData } from 'firebase/firestore'

export type ImageContentTypes = `image/${'jpeg' | 'jpg' | 'png'}`

export type Plans = 'free' | 'pro' | 'enterprise'

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
  /**
   * Name on the account
   */
  name: string 
  /**
  * Email on the account
  */
  email: string
  /**
  * Date the account was created
  */
  createDate: Date
}

export type ServiceTypes = 'optimize' | 'cdn' | 'ai'
