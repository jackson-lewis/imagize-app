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
   * The number of credits already used in the calendar month.
   */
  creditsUsed: number
}