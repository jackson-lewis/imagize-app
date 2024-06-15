import { DocumentData } from 'firebase/firestore'

export type ImageContentTypes = `image/${'jpeg' | 'jpg' | 'png'}`

export type Plans = 'free' | 'pro' | 'enterprise'

export type ServiceTypes = 'optimize' | 'cdn' | 'ai'

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
  createDate?: Date
  /**
   * List of domains authenticated with the account.
   */
  domains?: string[]
}

export type ServiceTypesUsage = {
  [key in ServiceTypes]: number
}


type PlanPrice = {
  id: string
  amount: number
}

export interface PlanObject extends DocumentData {
  name: string
  price: {
    monthly: PlanPrice
    yearly: PlanPrice
  }
  marketing_features: string[]
}