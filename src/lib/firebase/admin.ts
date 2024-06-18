import { doc, updateDoc } from 'firebase/firestore'
import { firestore } from './config'
import { BillingCycles } from '../types'


/**
 * Update the price on a product
 */
export async function updatePrice(
  productId: string,
  priceId: string,
  price: number,
  billingCycle: BillingCycles
) {
  await updateDoc(doc(firestore, 'plans', productId), {
    [`price.${billingCycle}`]: {
      id: priceId,
      amount: price
    }
  })
}


/**
 * Update a plan
 */
export async function updatePlan(productId: string, data: any) {
  await updateDoc(doc(firestore, 'plans', productId), data)
}
