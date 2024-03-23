import { CreditTypes, Plans } from './types'

/**
 * The number of monthly credits available for the Free plan.
 */
export const FREE_PLAN_CREDIT_LIMIT = 20

/**
 * The number of monthly credits available
 */
export const LIMITS: {
  [key in Plans]: {
    [key in CreditTypes]: number
  }
} = {
  free: {
    optimize: 100,
    cdn: 100,
    ai: 20
  },
  pro: {
    optimize: 1000,
    cdn: 1000,
    ai: 500
  },
  enterprise: {
    optimize: 2000,
    cdn: 2000,
    ai: 1000
  }
}
