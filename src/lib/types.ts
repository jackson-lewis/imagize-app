import { DocumentData } from 'firebase/firestore'

export type ImageContentTypes = `image/${'jpeg' | 'jpg' | 'png'}`

export type ServiceTypes = 'optimize' | 'cdn' | 'ai'

export type FreePlan = 'free'
export type PaidPlans = 'pro' | 'enterprise'
export type Plans = FreePlan | PaidPlans

export type BillingCycles = 'monthly' | 'yearly'

export interface BaseAccount {
  /**
     * The API key used to authenticate requests.
     */
  key: `i_${string}`
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

export interface FreeAccount extends BaseAccount {
  plan: FreePlan
}

export interface PaidAccount extends BaseAccount {
  plan: PaidPlans
  subscriptionId: string
  billingCycle: BillingCycles
  billingCycleDate: {
    seconds: number
  }
}

export type Account = FreeAccount | PaidAccount

export type ServiceTypesUsage = Record<ServiceTypes, number>

export type AccountUsage = Record<ServiceTypes, {
  [Year: string]: {
    [Month: string]: {
      [Day: string]: number
    }
  }
}>

type PlanPrice = {
  id: string
  amount: number
}

export interface PlanObject extends DocumentData {
  /**
   * The Stripe product ID
   */
  id: string
  /**
   * The plan name
   */
  name: string
  price: Record<BillingCycles, PlanPrice>
  marketing_features: string[]
}